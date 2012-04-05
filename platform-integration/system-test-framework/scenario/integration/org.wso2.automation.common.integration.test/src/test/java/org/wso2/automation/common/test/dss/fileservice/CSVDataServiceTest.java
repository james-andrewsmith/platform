/*
*Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*WSO2 Inc. licenses this file to you under the Apache License,
*Version 2.0 (the "License"); you may not use this file except
*in compliance with the License.
*You may obtain a copy of the License at
*
*http://www.apache.org/licenses/LICENSE-2.0
*
*Unless required by applicable law or agreed to in writing,
*software distributed under the License is distributed on an
*"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*KIND, either express or implied.  See the License for the
*specific language governing permissions and limitations
*under the License.
*/
package org.wso2.automation.common.test.dss.fileservice;

import org.apache.axiom.om.OMAbstractFactory;
import org.apache.axiom.om.OMElement;
import org.apache.axiom.om.OMFactory;
import org.apache.axiom.om.OMNamespace;
import org.apache.axis2.AxisFault;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.wso2.platform.test.core.utils.axis2client.AxisServiceClient;
import org.wso2.automation.common.test.dss.utils.DataServiceTest;

public class CSVDataServiceTest extends DataServiceTest {
    private static final Log log = LogFactory.getLog(CSVDataServiceTest.class);

    @Override
    protected void setServiceName() {
        serviceName = "CSVDataService";
    }

    @Test(priority = 1, dependsOnMethods = {"serviceDeployment"})
    public void selectOperation() throws AxisFault {
        OMFactory fac = OMAbstractFactory.getOMFactory();
        OMNamespace omNs = fac.createOMNamespace("http://ws.wso2.org/dataservice/samples/csv_sample_service", "ns1");
        OMElement payload = fac.createOMElement("getProducts", omNs);

        for (int i = 0; i < 5; i++) {
            OMElement result = new AxisServiceClient().sendReceive(payload, serviceEndPoint, "getProducts");
            Assert.assertTrue((result.toString().indexOf("Products") == 1), "Expected Result not found on response message");
            Assert.assertTrue(result.toString().contains("<Product>"), "Expected Result not found on response message");
            Assert.assertTrue(result.toString().contains("<ID>"), "Expected Result not found on response message");
            Assert.assertTrue(result.toString().contains("<Category>"), "Expected Result not found on response message");
            Assert.assertTrue(result.toString().contains("<Price>"), "Expected Result not found on response message");
            Assert.assertTrue(result.toString().contains("<Name>"), "Expected Result not found on response message");

        }
        log.info("Service invocation success");
    }


}
