/**
 * Copyright (c) 2009, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.carbon.bam.core.ui;

import org.apache.axis2.AxisFault;
import org.apache.axis2.client.Options;
import org.apache.axis2.client.ServiceClient;
import org.apache.axis2.context.ConfigurationContext;
import org.wso2.carbon.bam.core.stub.ConnectionAdminServiceConfigurationException;
import org.wso2.carbon.bam.core.stub.ConnectionAdminServiceStub;
import org.wso2.carbon.bam.core.stub.types.ConnectionDTO;

import java.rmi.RemoteException;

public class ConnectionAdminClient {

    private ConnectionAdminServiceStub stub;

    private String CONNECTION_ADMIN_SERVICE_URL = "ConnectionAdminService";

    public ConnectionAdminClient(String cookie, String backendServerURL,
                            ConfigurationContext configCtx) throws AxisFault {
        String serviceURL = backendServerURL + CONNECTION_ADMIN_SERVICE_URL;
        stub = new ConnectionAdminServiceStub(configCtx, serviceURL);
        ServiceClient client = stub._getServiceClient();
        Options option = client.getOptions();
        option.setManageSession(true);
        option.setProperty(org.apache.axis2.transport.http.HTTPConstants.COOKIE_STRING, cookie);
    }

    public void configureConnectionParameters(String userName, String password)
            throws AxisFault {

        try {
            stub.configureConnectionParameters(userName, password);
        } catch (RemoteException e) {
            throw new AxisFault("Unable to configure connection parameters..", e);
        } catch (ConnectionAdminServiceConfigurationException e) {
            throw new AxisFault("Unable to configure connection parameters..", e);
        }

    }

    public ConnectionDTO getConnectionParameters() throws AxisFault {

        try {
            return stub.getConnectionParameters();
        } catch (RemoteException e) {
            throw new AxisFault("Unable to fetch connection parameters..", e);
        } catch (ConnectionAdminServiceConfigurationException e) {
            throw new AxisFault("Unable to fetch connection parameters..", e);
        }

    }
    
}
