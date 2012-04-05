/*
 * Copyright 2005-2007 WSO2, Inc. (http://wso2.com)
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

package org.wso2.carbon.webapp.mgt;

import org.wso2.carbon.tomcat.api.CarbonTomcatService;
import org.wso2.carbon.utils.CarbonUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * A set of utility methods for interacting with Embedded Tomcat
 */
public class TomcatUtil {
    private static CarbonTomcatService carbonTomcatService;
    private static Map<String, TomcatGenericWebappsDeployer> webappsDeployers
        = new HashMap<String, TomcatGenericWebappsDeployer>();



    public static boolean checkUnpackWars() {
        return Boolean.parseBoolean(System.getProperty("carbon.unpack.wars", "false"));
    }


    /**
     * Add a TomcatGenericWebappsDeployer
     *
     * @param webappsDir      The directory in which the webapps are found
     * @param webappsDeployer The corresponding TomcatGenericWebappsDeployer
     */
    @SuppressWarnings("unused")
    public static void addWebappsDeployer(String webappsDir,
                                          TomcatGenericWebappsDeployer webappsDeployer) {
        CarbonUtils.checkSecurity();
        webappsDeployers.put(webappsDir, webappsDeployer);
    }

    /**
     * Retrieve the list of registered webapps deployers
     *
     * @return an unmodifiable list of registered webapps deployers
     */
    @SuppressWarnings("unused")
    public static Map<String, TomcatGenericWebappsDeployer> getWebappsDeployers() {
        CarbonUtils.checkSecurity();
        return Collections.unmodifiableMap(webappsDeployers);
    }
}
