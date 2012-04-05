/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *   * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */
package org.wso2.carbon.rule.service.ui;

import org.apache.commons.logging.Log;
import org.wso2.carbon.rule.core.LoggedRuntimeException;

/**
 * Acts as a decorator and do log in addition to the existing behaviour of the exception
 */
public class RuleServiceClientException extends LoggedRuntimeException {

    public RuleServiceClientException(String msg, Log log) {
        super(msg, log);
    }

    public RuleServiceClientException(String msg, Throwable throwable, Log log) {
        super(msg, throwable, log);
    }
}
