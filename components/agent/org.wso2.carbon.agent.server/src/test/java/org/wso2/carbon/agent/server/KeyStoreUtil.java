/*
*  Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
package org.wso2.carbon.agent.server;

import java.io.File;

public class KeyStoreUtil {

    File filePath;

    public static void setTrustStoreParams() {
        File filePath = new File("src/test/resources");
        if (!filePath.exists()) {
            filePath = new File("org.wso2.carbon.agent.server/src/test/resources");
        }
        String trustStore = filePath.getAbsolutePath();
//        String trustStore = "/home/suho/projects/wso2/trunk/graphite/components/agent/org.wso2.carbon.agent.server/src/test/resources";
//        String trustStore = "/home/suho/projects/wso2/trunk/graphite/products/cep/modules/distribution/product/target/wso2cep-1.0.0-SNAPSHOT/repository/resources/security";
        System.setProperty("javax.net.ssl.trustStore", trustStore + "/client-truststore.jks");
        System.setProperty("javax.net.ssl.trustStorePassword", "wso2carbon");

    }

    public static void setKeyStoreParams() {
        File filePath = new File("src/test/resources");
        if (!filePath.exists()) {
            filePath = new File("org.wso2.carbon.agent.server/src/test/resources");
        }
        String keyStore = filePath.getAbsolutePath();
//        String keyStore = "/home/suho/projects/wso2/trunk/graphite/components/agent/org.wso2.carbon.agent.server/src/test/resources";
//        String keyStore = "/home/suho/projects/wso2/trunk/graphite/products/cep/modules/distribution/product/target/wso2cep-1.0.0-SNAPSHOT/repository/resources/security";
        System.setProperty("Security.KeyStore.Location", keyStore + "/wso2carbon.jks");
        System.setProperty("Security.KeyStore.Password", "wso2carbon");

    }
}
