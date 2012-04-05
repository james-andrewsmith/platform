/*
 * Copyright (c) 2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.wso2.automation.cloud.regression;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.testng.annotations.BeforeClass;
import org.wso2.platform.test.core.utils.UserInfo;
import org.wso2.platform.test.core.utils.UserListCsvReader;
import org.wso2.platform.test.core.utils.environmentutils.EnvironmentBuilder;
import org.wso2.platform.test.core.utils.environmentutils.EnvironmentVariables;

public class StratosBAMServiceTest {
    private static final Log log = LogFactory.getLog(StratosBAMServiceTest.class);

    @BeforeClass
    public void init() {
        EnvironmentBuilder builder = new EnvironmentBuilder().bam(4);
        EnvironmentVariables appServer = builder.build().getBam();
        UserInfo userInfo = UserListCsvReader.getUserInfo(4);
//        String HTTP_APPSERVER_STRATOSLIVE_URL = "http://" + appServer.getProductVariables().getHostName()
//                                         + "/services/t/" + userInfo.getDomain();
    }

}
