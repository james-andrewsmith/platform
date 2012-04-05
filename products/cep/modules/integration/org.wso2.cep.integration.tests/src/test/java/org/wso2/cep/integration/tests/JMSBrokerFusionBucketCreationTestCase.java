package org.wso2.cep.integration.tests;

import org.apache.axis2.client.Options;
import org.apache.axis2.client.ServiceClient;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.wso2.carbon.cep.stub.admin.CEPAdminServiceCEPAdminException;
import org.wso2.carbon.cep.stub.admin.CEPAdminServiceCEPConfigurationException;
import org.wso2.carbon.cep.stub.admin.CEPAdminServiceStub;
import org.wso2.carbon.cep.stub.admin.internal.xsd.BucketDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.ExpressionDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.InputDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.InputXMLMappingDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.OutputDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.OutputElementMappingDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.OutputXMLMappingDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.QueryDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.XMLPropertyDTO;
import org.wso2.carbon.cep.stub.admin.internal.xsd.XpathDefinitionDTO;
import org.wso2.carbon.integration.framework.ClientConnectionUtil;
import org.wso2.carbon.integration.framework.LoginLogoutUtil;

import java.rmi.RemoteException;

/**
 * Check whether CEPAdminService properly creates FusionBucket to be used with JMS broker
 */
public class JMSBrokerFusionBucketCreationTestCase {
    private LoginLogoutUtil util = new LoginLogoutUtil();
    private CEPAdminServiceStub cepAdminServiceStub;

    @BeforeClass(groups = {"wso2.cep"})
    public void login() throws Exception {
        ClientConnectionUtil.waitForPort(9443);
        String loggedInSessionCookie = util.login();
        cepAdminServiceStub =
                new CEPAdminServiceStub("https://localhost:9443/services/CEPAdminService");
        ServiceClient client = cepAdminServiceStub._getServiceClient();
        Options options = client.getOptions();
        options.setManageSession(true);
        options.setProperty(org.apache.axis2.transport.http.HTTPConstants.COOKIE_STRING,
                            loggedInSessionCookie);
    }

    @AfterClass(groups = {"wso2.cep"})
    public void logout() throws Exception {
        ClientConnectionUtil.waitForPort(9443);
        util.logout();
    }

    @Test(groups = {"wso2.cep"})
    public void fusionBucketCreationTest()
            throws CEPAdminServiceCEPConfigurationException, RemoteException,
                   CEPAdminServiceCEPAdminException, InterruptedException {


        int numberOfBuckets = cepAdminServiceStub.getAllBucketCount();

        BucketDTO bucket = createBucket();

        InputDTO input = createInput();
        QueryDTO query = createQuery();
        OutputDTO output = createOutput();
        query.setOutput(output);
        bucket.setInputs(new InputDTO[]{input});
        bucket.setQueries(new QueryDTO[]{query});

        cepAdminServiceStub.addBucket(bucket);

        /* extra time for all the services to be properly deployed */
        Thread.sleep(5000);
        Assert.assertEquals(++numberOfBuckets, cepAdminServiceStub.getAllBucketCount());

    }

    private BucketDTO createBucket() {
        BucketDTO bucket = new BucketDTO();

        bucket.setName("StockQuoteAnalyzerJMSFusion");
        bucket.setDescription("This bucket analyzes stock quotes and trigger an event" +
                              " if the last traded amount is greater than 100.");
        bucket.setEngineProvider("DroolsFusionCEPRuntime");
        return bucket;
    }

    private InputDTO createInput() {
        InputDTO input = new InputDTO();
        input.setTopic("AllStockQuotes");
        input.setBrokerName("jmsBroker");

        InputXMLMappingDTO mapping = new InputXMLMappingDTO();
        mapping.setStream("allStockQuotes");

        XpathDefinitionDTO xpathDefinition = new XpathDefinitionDTO();
        xpathDefinition.setPrefix("quotedata");
        xpathDefinition.setNamespace("http://ws.cdyne.com/");

        mapping.setXpathDefinition(new XpathDefinitionDTO[]{xpathDefinition});

        XMLPropertyDTO propertySymbol = new XMLPropertyDTO();
        propertySymbol.setName("symbol");
        propertySymbol.setXpath("//quotedata:StockQuoteEvent/quotedata:StockSymbol");
        propertySymbol.setType("java.lang.String");

        XMLPropertyDTO propertyPrice = new XMLPropertyDTO();
        propertyPrice.setName("price");
        propertyPrice.setXpath("//quotedata:StockQuoteEvent/quotedata:LastTradeAmount");
        propertyPrice.setType("java.lang.Double");

        mapping.setProperties(new XMLPropertyDTO[]{propertySymbol, propertyPrice});

        input.setInputXMLMappingDTO(mapping);
        return input;
    }

    private QueryDTO createQuery() {
        QueryDTO query = new QueryDTO();
        query.setName("Conditional Stocks Detector");

        ExpressionDTO expression = new ExpressionDTO();
        expression.setType("inline");
        expression.setText("package org.wso2.carbon.cep.fusion;\n" +
                           "\t\t\t\t\t\t\timport java.util.HashMap;\n" +
                           "\t\t\t\t\t\t\tglobal org.wso2.carbon.cep.fusion.listener.FusionEventListener fusionListener;\n" +
                           "\t\t\t\t\t\t\tdeclare HashMap\n" +
                           "\t\t\t\t\t\t\t@role( event )\n" +
                           "\t\t\t\t\t\t\tend\n" +
                           "\t\t\t\t\t\t\trule Invoke_Stock_Quotes\n" +
                           "\t\t\t\t\t\t\twhen\n" +
                           "\t\t\t\t\t\t\t    $stockQuote : HashMap($symbol : this[\"symbol\"], $stockPrice : this[\"price\"], this[\"picked\"] != \"true\") over\n" +
                           "\t\t\t\t\t\t\t\twindow:time(2m) from entry-point \"allStockQuotes\";\n" +
                           "\t\t\t\t\t\t\t    $average : Double() from accumulate(HashMap(this[\"symbol\"] == $symbol,$price : this[\"price\"]) over window:time(2m) from entry-point \t\t\t\t\t\t\t\t\"allStockQuotes\" , average( $price));\n" +
                           "\t\t\t\t\t\t\t    eval((Double)$stockPrice > $average * 1.01);\n" +
                           "\t\t\t\t\t\t\tthen\n" +
                           "\t\t\t\t\t\t\t    $stockQuote.put(\"picked\",\"true\");\n" +
                           "\t\t\t\t\t\t\t    update($stockQuote);\n" +
                           "\t\t\t\t\t\t\t    HashMap $fastMovingStock = new HashMap();\n" +
                           "\t\t\t\t\t\t\t    $fastMovingStock.put(\"price\",$stockPrice);\n" +
                           "\t\t\t\t\t\t\t    $fastMovingStock.put(\"symbol\",$symbol);\n" +
                           "\t\t\t\t\t\t\t    $fastMovingStock.put(\"average\",$average);\n" +
                           "\t\t\t\t\t\t\t    fusionListener.onEvent($fastMovingStock);\n" +
                           "\t\t\t\t\t\t\tend");

        query.setExpression(expression);
        return query;
    }

    private OutputDTO createOutput() {
        OutputDTO output = new OutputDTO();
        output.setTopic("FastMovingStockQuotes");
        output.setBrokerName("jmsBroker");

        OutputXMLMappingDTO xmlMapping = new OutputXMLMappingDTO();
        xmlMapping.setMappingXMLText("<quotedata:StockQuoteDataEvent xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
                                     "                                                       xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"\n" +
                                     "                                                       xmlns:quotedata=\"http://ws.cdyne.com/\">\n" +
                                     "                            <quotedata:StockSymbol>{symbol}</quotedata:StockSymbol>\n" +
                                     "               <quotedata:AvgLastTradeAmount>{average)}</quotedata:AvgLastTradeAmount>\n" +
                                     "                            <quotedata:LastTradeAmount>{price}</quotedata:LastTradeAmount>\n" +
                                     "                            </quotedata:StockQuoteDataEvent>");

        output.setOutputXmlMapping(xmlMapping);

        OutputElementMappingDTO elementMapping = new OutputElementMappingDTO();
        elementMapping.setDocumentElement("");

        output.setOutputElementMapping(elementMapping);
        return output;
    }

}
