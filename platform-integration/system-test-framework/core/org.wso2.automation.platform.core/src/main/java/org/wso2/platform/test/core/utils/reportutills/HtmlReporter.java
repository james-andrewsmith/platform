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

package org.wso2.platform.test.core.utils.reportutills;

import org.apache.maven.doxia.siterenderer.Renderer;
import org.apache.maven.project.MavenProject;
import org.apache.maven.reporting.AbstractMavenReport;
import org.apache.maven.reporting.MavenReportException;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.Locale;


public class HtmlReporter extends AbstractMavenReport {

    private MavenProject project;
    private String outputDir;
    private String cssFile;
    private String reportTitle;
    private boolean sortTestCaseLinks;
    private String reportDescription;
    private String surefireReportDirectory;
    private boolean showRuntimeTotals;
    private String testDetailsFilter;

    public void executeReport(Locale locale) throws MavenReportException {
        String testNgResultsXml = getTestNgResultsXmlPath();
        getLog().info("TestNG XSLT is processing file '" + testNgResultsXml + "'");
        if (!new File(testNgResultsXml).exists()) {
            getLog().warn("File 'testng-results.xml' could not be found. No reports will be generated by TestNG XSLT");
            return;
        }

        try {
            Thread.currentThread().setContextClassLoader(net.sf.saxon.TransformerFactoryImpl.class.getClassLoader());

            System.setProperty("javax.xml.transform.TransformerFactory", "net.sf.saxon.TransformerFactoryImpl");
            TransformerFactory factory = TransformerFactory.newInstance();
            String outputDir = getHtmlOutputDir();
            getLog().info("TestNG XSLT is generating HTML in directory '" + outputDir + "'");
            new File(outputDir).mkdirs();
            System.setProperty("javax.xml.transform.TransformerFactory","net.sf.saxon.TransformerFactoryImpl");
            TransformerFactory tfactory = TransformerFactory.newInstance();

            StreamSource inputSource = new StreamSource(new File( getTestNgResultsXmlPath()));
            Transformer transformer = factory.newTransformer(new StreamSource(getClass().getResourceAsStream("testng-results.xsl")));

            transformer.setParameter("testNgXslt.outputDir", outputDir);
            if (cssFile != null && cssFile.trim().length() > 0) {
                transformer.setParameter("testNgXslt.cssFile", cssFile);
            }
            transformer.setParameter("testNgXslt.showRuntimeTotals", String.valueOf(showRuntimeTotals));
            transformer.setParameter("testNgXslt.reportTitle", "dddddddd");
            transformer.setParameter("testNgXslt.sortTestCaseLinks", String.valueOf(sortTestCaseLinks));
            transformer.setParameter("testNgXslt.testDetailsFilter", testDetailsFilter);

            getLog().info("Transformer parameters are:");
            getLog().info("\t\ttestNgXslt.outputDir:         " + transformer.getParameter("testNgXslt.outputDir"));
            getLog().info("\t\ttestNgXslt.cssFile:           " + transformer.getParameter("testNgXslt.cssFile"));
            getLog().info("\t\ttestNgXslt.showRuntimeTotals: " + transformer.getParameter("testNgXslt.showRuntimeTotals"));
            getLog().info("\t\ttestNgXslt.reportTitle:       " + transformer.getParameter("testNgXslt.reportTitle"));
            getLog().info("\t\ttestNgXslt.sortTestCaseLinks: " + transformer.getParameter("testNgXslt.sortTestCaseLinks"));
  ;
        //    transformer.transform( new StreamSource( srcFile ), new StreamResult( destFile ) );
            transformer.transform(inputSource, new StreamResult(new FileOutputStream(outputDir + File.separator + "index2.html")));
        } catch (FileNotFoundException fnfException) {
            throw new MavenReportException("An error occured during TestNG XSLT transformation", fnfException);
        } catch (TransformerConfigurationException tcException) {
            throw new MavenReportException("An error occured during TestNG XSLT transformation", tcException);
        } catch (TransformerException tException) {
            throw new MavenReportException("An error occured during TestNG XSLT transformation", tException);
        }
    }

    private String getHtmlOutputDir() {
      return "/home/dharshana/automation/testNgIntegration1/system-test-framework/reports";
    }

    private String getTestNgResultsXmlPath() {

        return "/home/dharshana/automation/testNgIntegration1/system-test-framework/reports/BPSScenariosSuite/testng-results.xml";
    }

    public String getDescription(Locale locale) {
        return reportDescription;
    }

    public String getName(Locale locale) {
        return "testReport";
    }

    protected String getOutputDirectory() {
        return outputDir;
    }

    public String getOutputName() {
        final String reportingOutputDir = getProject().getReporting().getOutputDirectory();
        String outputName = getOutputDirectory() + File.separator + "index";
        if (outputName.startsWith(reportingOutputDir)) {
            outputName = outputName.substring(reportingOutputDir.length() + 1);/*also trim path sep*/
        }
        return outputName;
    }

    protected MavenProject getProject() {
        return project;
    }

    public boolean isExternalReport() {
        return true;
    }

    @Override
    protected Renderer getSiteRenderer() {
        return null;
    }
}
