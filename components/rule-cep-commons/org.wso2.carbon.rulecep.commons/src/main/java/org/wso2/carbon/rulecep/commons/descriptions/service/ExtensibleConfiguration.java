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
package org.wso2.carbon.rulecep.commons.descriptions.service;

/**
 * Any configuration that has extensions for the configuration and if those extensions should be
 * built through the <coce>ExtensionBuilderAndFactory</code> and should be serialized through
 * <code>ExtensionSerializer</code>, then that configuration should be a type of this class
 */
public abstract class ExtensibleConfiguration {

    /**
     * Returns an identifier for the ExtensibleConfiguration
     *
     * @return <code>String</code> an non empty identifier for the ExtensibleConfiguration
     */
    public abstract String geType();
}
