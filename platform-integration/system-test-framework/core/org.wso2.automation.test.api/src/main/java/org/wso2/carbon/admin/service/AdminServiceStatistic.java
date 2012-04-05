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
package org.wso2.carbon.admin.service;

import junit.framework.Assert;
import org.apache.axis2.AxisFault;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.admin.service.utils.AuthenticateStub;
import org.wso2.carbon.statistics.stub.StatisticsAdminStub;
import org.wso2.carbon.statistics.stub.types.carbon.OperationStatistics;
import org.wso2.carbon.statistics.stub.types.carbon.ServiceStatistics;
import org.wso2.carbon.statistics.stub.types.carbon.SystemStatistics;

import java.rmi.RemoteException;

public class AdminServiceStatistic {

    private final Log log = LogFactory.getLog(AdminServiceWebAppAdmin.class);

    private StatisticsAdminStub statisticsAdminStub;

    public AdminServiceStatistic(String backendServerURL, String sessionCookie) {
        String serviceName = "StatisticsAdmin";
        String endPoint = backendServerURL + serviceName;
        try {
            statisticsAdminStub = new StatisticsAdminStub(endPoint);
            new AuthenticateStub().authenticateStub(sessionCookie, statisticsAdminStub);
        } catch (AxisFault axisFault) {
            log.error("Statistics Admin initialization fail: " + axisFault.getMessage());
            Assert.fail("Statistics Admin initialization fail: " + axisFault.getMessage());
        }
    }

    public SystemStatistics getSystemStatistics() throws RemoteException {
        try {
            return statisticsAdminStub.getSystemStatistics();
        } catch (RemoteException e) {
            handleException("Cannot get system statistics", e);
        }
        return null;
    }

    public ServiceStatistics getServiceStatistics(String serviceName) throws RemoteException {
        try {
            return statisticsAdminStub.getServiceStatistics(serviceName);
        } catch (RemoteException e) {
            handleException("Cannot get service statistics", e);
        }
        return null;
    }

    public OperationStatistics getOperationStatistics(String serviceName,
                                                      String operationName) throws RemoteException {
        try {
            return statisticsAdminStub.getOperationStatistics(serviceName, operationName);
        } catch (RemoteException e) {
            handleException("Cannot get operation statistics", e);
        }
        return null;
    }

    private void handleException(String msg, Exception e) throws RemoteException {
        log.error(msg, e);
        throw new RemoteException(msg, e);
    }
}
