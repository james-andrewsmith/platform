package org.wso2.carbon.messagebox.admin.internal.exception;

/**
 * Copyright (c) 2009, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

public class MessageBoxAdminException extends Exception {
    public String errorMessage;

    public MessageBoxAdminException() {
    }

    public MessageBoxAdminException(String message) {
        super(message);
        errorMessage = message;
    }

    public MessageBoxAdminException(String message, Throwable cause) {
        super(message, cause);
        errorMessage = message;
    }

    public MessageBoxAdminException(Throwable cause) {
        super(cause);
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
