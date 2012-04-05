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
package org.wso2.automation.common.test.bps.uploadscenarios;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import org.wso2.carbon.admin.service.AdminServiceAuthentication;
import org.wso2.carbon.admin.service.AdminServiceBpelPackageManager;
import org.wso2.carbon.admin.service.AdminServiceBpelUploader;
import org.wso2.carbon.bpel.stub.mgt.PackageManagementException;
import org.wso2.platform.test.core.utils.environmentutils.EnvironmentBuilder;
import org.wso2.platform.test.core.utils.environmentutils.ManageEnvironment;

import java.net.MalformedURLException;
import java.rmi.RemoteException;

public class BpelRedeployClient{
    String sessionCookie = null;
    private static final Log log = LogFactory.getLog(BpelRedeployClient.class);
    String backEndUrl = null;
    AdminServiceBpelUploader bpelUploader;
    AdminServiceBpelPackageManager bpelManager;
    AdminServiceAuthentication adminServiceAuthentication;
    ManageEnvironment environment;

    @BeforeTest(alwaysRun = true)
    public void setEnvironment() {
        EnvironmentBuilder builder = new EnvironmentBuilder().bps(3);
        environment = builder.build();
        backEndUrl = environment.getBps().getBackEndUrl();

        sessionCookie = environment.getBps().getSessionCookie();
        adminServiceAuthentication = environment.getBps().getAdminServiceAuthentication();
        bpelUploader = new AdminServiceBpelUploader(backEndUrl);
        bpelManager = new AdminServiceBpelPackageManager(backEndUrl, sessionCookie);
    }

    @Test(groups = {"wso2.bps", "wso2.bps.manage"}, description = "Tests redeploy bpel",priority=0)
    public void testUplpad() throws InterruptedException, RemoteException, PackageManagementException, MalformedURLException {
        bpelUploader.deployBPEL("HelloWorld2", sessionCookie);
        bpelManager.undeployBPEL("HelloWorld2");
    }

    @Test(groups = {"wso2.bps", "wso2.bps.manage"}, description = "Tests redeploy bpel",priority=0)
    public void testRedeploy() throws InterruptedException, RemoteException, PackageManagementException, MalformedURLException {
        bpelUploader.deployBPEL("HelloWorld2", sessionCookie);
        bpelManager.checkProcessDeployment("HelloWorld2");
    }


    @AfterClass(alwaysRun = true)
    public void removeArtifacts() throws PackageManagementException, InterruptedException, RemoteException {
        bpelManager.undeployBPEL("HelloWorld2");
        adminServiceAuthentication.logOut();
    }
}
