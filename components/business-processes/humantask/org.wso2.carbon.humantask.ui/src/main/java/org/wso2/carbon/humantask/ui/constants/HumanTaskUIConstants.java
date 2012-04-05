/*
 * Copyright (c) WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.humantask.ui.constants;

/**
 * A place holder interface for human task ui component's constatns.
 */
public interface HumanTaskUIConstants {

    /**
     * JSP pages to be referred throughout the ui module.
     */
    public interface PAGES {

        public static final String PACKAGE_LIST_PAGE = "/humantask/humantask_definition_list.jsp";

        public static final String UPLOAD_PAGE = "/humantask/upload_humantask.jsp";

    }

    /**
     * Service names to be referred throughout the ui module.
     */
    public interface SERVICE_NAMES {

        public static final String TASK_OPERATIONS_SERVICE = "taskOperations";

        public static final String HUMANTASK_MANAGEMENT_SERVICE = "HumanTaskPackageManagement";

        public static final String HUMANTASK_UPLOADER_SERVICE_NAME = "HumanTaskUploader";
    }

    /**
     * File names to be referred throughout the ui module.
     */
    public interface FILE_NAMES {
        public static final String HT_CONFIG_NAME = "htconfig.xml";
    }
}
