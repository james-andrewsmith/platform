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
package org.wso2.carbon.registry.search.metadata.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.wso2.carbon.automation.api.clients.registry.SearchAdminServiceClient;
import org.wso2.carbon.integration.framework.ClientConnectionUtil;
import org.wso2.carbon.integration.framework.LoginLogoutUtil;
import org.wso2.carbon.integration.framework.utils.FrameworkSettings;
import org.wso2.carbon.registry.core.Resource;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.registry.search.metadata.test.bean.SearchParameterBean;
import org.wso2.carbon.registry.search.metadata.test.utils.GregTestUtils;
import org.wso2.carbon.registry.search.stub.SearchAdminServiceRegistryExceptionException;
import org.wso2.carbon.registry.search.stub.beans.xsd.AdvancedSearchResultsBean;
import org.wso2.carbon.registry.search.stub.beans.xsd.ArrayOfString;
import org.wso2.carbon.registry.search.stub.beans.xsd.CustomSearchParameterBean;
import org.wso2.carbon.registry.search.stub.common.xsd.ResourceData;
import org.wso2.carbon.registry.ws.client.registry.WSRegistryServiceClient;

import java.rmi.RemoteException;
import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/*
search registry metadata by resource updated data
*/
public class RegistrySearchByUpdatedDataTestCase {
    private static final Log log = LogFactory.getLog(RegistrySearchByUpdatedDataTestCase.class);

    private String sessionCookie;

    private SearchAdminServiceClient searchAdminService;
    private WSRegistryServiceClient registry;
    private String userName;

    @BeforeClass
    public void init() throws Exception {
        final String SERVER_URL = GregTestUtils.getServerUrl();
        ClientConnectionUtil.waitForPort(Integer.parseInt(FrameworkSettings.HTTP_PORT));
        sessionCookie = new LoginLogoutUtil().login();
        searchAdminService = new SearchAdminServiceClient(SERVER_URL, sessionCookie);
        registry = GregTestUtils.getRegistry();
        userName = FrameworkSettings.USER_NAME;

    }

    @Test(priority = 1, groups = {"wso2.greg"}, description = "Metadata search by updated date from")
    public void searchResourceByUpdatedDateFrom()
            throws SearchAdminServiceRegistryExceptionException, RemoteException,
                   RegistryException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        Calendar calender = Calendar.getInstance();
        calender.add(Calendar.YEAR, -1);
        paramBean.setUpdatedAfter(formatDate(calender.getTime()));

        ArrayOfString[] paramList = paramBean.getParameterList();
        log.info("From Date : " + formatDate(calender.getTime()));


        searchQuery.setParameterValues(paramList);
        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNotNull(result.getResourceDataList(), "No Record Found");
        Assert.assertTrue((result.getResourceDataList().length > 0), "No Record Found. set valid from date");
        log.info(result.getResourceDataList().length + " Records found");
        for (ResourceData resource : result.getResourceDataList()) {
            Resource rs = registry.get(resource.getResourcePath());
            Assert.assertTrue(calender.getTime().before(rs.getLastModified()),
                              "Resource updated date is a previous date of the mentioned date on From date:" +
                              " Actual Date: " + formatDate(rs.getLastModified())
                              + " Mentioned From Date : " + formatDate(calender.getTime()));

        }

    }

    @Test(priority = 2, groups = {"wso2.greg"}, description = "Metadata search by updated date To")
    public void searchResourceByUpdatedDateTo()
            throws SearchAdminServiceRegistryExceptionException, RemoteException,
                   RegistryException, InterruptedException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        Calendar calender = Calendar.getInstance();
        log.info("To Date : " + formatDate(calender.getTime()));
        paramBean.setUpdatedBefore(formatDate(calender.getTime()));
        paramBean.setUpdater(userName);
        ArrayOfString[] paramList = paramBean.getParameterList();

        searchQuery.setParameterValues(paramList);
        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNotNull(result.getResourceDataList(), "No Record Found");
        Assert.assertTrue((result.getResourceDataList().length > 0), "No Record Found. set valid to date");
        log.info(result.getResourceDataList().length + " Records found");

        for (ResourceData resource : result.getResourceDataList()) {
            Resource rs = registry.get(resource.getResourcePath());
            Assert.assertTrue(calender.getTime().after(rs.getLastModified()),
                              resource.getResourcePath() + " Resource updated date is a later date of the mentioned date on From date. " +
                              " Actual Date: " + formatDate(rs.getLastModified())
                              + " Mentioned To Date : " + formatDate(calender.getTime()));

        }
    }

    @Test(priority = 3, groups = {"wso2.greg"}, description = "Metadata search from valid date range")
    public void searchResourceByValidUpdatedDateRange()
            throws SearchAdminServiceRegistryExceptionException, RemoteException,
                   RegistryException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        Calendar fromCalender = Calendar.getInstance();
        fromCalender.add(Calendar.MONTH, -1);
        log.info("From Date : " + formatDate(fromCalender.getTime()));
        paramBean.setUpdatedAfter(formatDate(fromCalender.getTime()));

        Calendar toCalender = Calendar.getInstance();
        log.info("To Date : " + formatDate(toCalender.getTime()));
        paramBean.setUpdatedBefore(formatDate(toCalender.getTime()));

        paramBean.setUpdater(userName);

        ArrayOfString[] paramList = paramBean.getParameterList();

        searchQuery.setParameterValues(paramList);
        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNotNull(result.getResourceDataList(), "No Record Found");
        Assert.assertTrue((result.getResourceDataList().length > 0), "No Record Found. set valid data range");
        log.info(result.getResourceDataList().length + " Records found");
        for (ResourceData resource : result.getResourceDataList()) {
            Resource rs = registry.get(resource.getResourcePath());
            Assert.assertTrue(toCalender.getTime().after(rs.getLastModified())
                              && fromCalender.getTime().before(rs.getLastModified()),
                              "Resource updated date is a not within the mentioned date range");

        }
    }

    @Test(priority = 4, groups = {"wso2.greg"}, description = "Metadata search from valid date range")
    public void searchResourceWithInvalidDateFormat()
            throws SearchAdminServiceRegistryExceptionException, RemoteException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        Format formatter = new SimpleDateFormat("yyyy/MM/dd");
        Calendar fromCalender = Calendar.getInstance();
        fromCalender.add(Calendar.YEAR, -1);
        log.info("From Date : " + formatter.format(fromCalender.getTime()));
        paramBean.setUpdatedAfter(formatter.format(fromCalender.getTime()));

        Calendar toCalender = Calendar.getInstance();
        log.info("To Date : " + formatter.format(toCalender.getTime()));
        paramBean.setUpdatedBefore(formatter.format(toCalender.getTime()));

        ArrayOfString[] paramList = paramBean.getParameterList();

        searchQuery.setParameterValues(paramList);
        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNull(result.getResourceDataList(), "Record Found for invalid data format");
    }

    @Test(priority = 5, groups = {"wso2.greg"}, description = "Metadata search records not in valid date range ")
    public void searchResourceByValidUpdatedDateRangeNot()
            throws SearchAdminServiceRegistryExceptionException, RemoteException,
                   RegistryException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        Calendar fromCalender = Calendar.getInstance();
        fromCalender.add(Calendar.YEAR, -3);
        log.info("From Date : " + formatDate(fromCalender.getTime()));
        paramBean.setUpdatedAfter(formatDate(fromCalender.getTime()));

        Calendar toCalender = Calendar.getInstance();
        toCalender.add(Calendar.YEAR, -1);
        log.info("To Date : " + formatDate(toCalender.getTime()));
        paramBean.setUpdatedBefore(formatDate(toCalender.getTime()));

        ArrayOfString[] paramList = paramBean.getParameterList();
        searchQuery.setParameterValues(paramList);

        // to set updatedRangeNegate
        ArrayOfString updatedRangeNegate = new ArrayOfString();
        updatedRangeNegate.setArray(new String[]{"updatedRangeNegate", "on"});

        searchQuery.addParameterValues(updatedRangeNegate);

        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNotNull(result.getResourceDataList(), "No Record Found");
        Assert.assertTrue((result.getResourceDataList().length > 0), "No Record Found. set valid data range");
        log.info(result.getResourceDataList().length + " Records found");
        for (ResourceData resource : result.getResourceDataList()) {
            Resource rs = registry.get(resource.getResourcePath());
            Assert.assertFalse((toCalender.getTime().after(rs.getLastModified())
                                && fromCalender.getTime().before(rs.getLastModified())),
                               "Resource updated date is a not within the mentioned date range");

        }
    }

    @Test(priority = 6, groups = {"wso2.greg"},
          description = "Metadata search from valid updated date range having no resource")
    public void searchResourceByValidUpdatedDateRangeHavingNoRecords()
            throws SearchAdminServiceRegistryExceptionException, RemoteException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        Calendar fromCalender = Calendar.getInstance();
        fromCalender.add(Calendar.YEAR, -5);
        log.info("From Date : " + formatDate(fromCalender.getTime()));
        paramBean.setUpdatedAfter(formatDate(fromCalender.getTime()));

        Calendar toCalender = Calendar.getInstance();
        toCalender.set(Calendar.YEAR, -3);
        log.info("To Date : " + formatDate(toCalender.getTime()));
        paramBean.setUpdatedBefore(formatDate(toCalender.getTime()));

        ArrayOfString[] paramList = paramBean.getParameterList();

        searchQuery.setParameterValues(paramList);
        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNull(result.getResourceDataList(), "Record Found");
    }

    @Test(priority = 7, groups = {"wso2.greg"}, description = "Metadata search from invalid updated date range")
    public void searchResourceByInValidDateRange()
            throws SearchAdminServiceRegistryExceptionException, RemoteException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        Calendar fromCalender = Calendar.getInstance();
        log.info("From Date : " + formatDate(fromCalender.getTime()));
        paramBean.setUpdatedAfter(formatDate(fromCalender.getTime()));

        Calendar toCalender = Calendar.getInstance();
        toCalender.set(Calendar.YEAR, -1);
        log.info("To Date : " + formatDate(toCalender.getTime()));
        paramBean.setUpdatedBefore(formatDate(toCalender.getTime()));

        ArrayOfString[] paramList = paramBean.getParameterList();

        searchQuery.setParameterValues(paramList);
        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNull(result.getResourceDataList(), "Record Found");
    }

    @Test(priority = 8, groups = {"wso2.greg"}, dataProvider = "invalidCharacter",
          description = "Metadata search by invalid String for updated date")
    public void searchResourceByInvalidValueForUpdatedDate(String invalidInput)
            throws SearchAdminServiceRegistryExceptionException, RemoteException {
        CustomSearchParameterBean searchQuery = new CustomSearchParameterBean();
        SearchParameterBean paramBean = new SearchParameterBean();
        paramBean.setUpdatedAfter(invalidInput);
        ArrayOfString[] paramList = paramBean.getParameterList();

        searchQuery.setParameterValues(paramList);
        AdvancedSearchResultsBean result = searchAdminService.getAdvancedSearchResults(searchQuery);
        Assert.assertNull(result.getResourceDataList(), "Result Object found.");

    }

    @DataProvider(name = "invalidCharacter")
    public Object[][] invalidCharacter() {
        return new Object[][]{
                {"invalid-date"},
                {"<a>"},
                {"#"},
                {"a|b"},
                {"   "},
                {"@"},
                {"|"},
                {"^"},
                {"abc^"},
                {"/"},
                {"\\"}
        };

    }

    private String formatDate(Date date) {
        Format formatter = new SimpleDateFormat("MM/dd/yyyy");
        return formatter.format(date);
    }
}
