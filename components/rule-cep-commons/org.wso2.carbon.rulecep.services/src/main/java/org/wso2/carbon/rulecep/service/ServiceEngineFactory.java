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
package org.wso2.carbon.rulecep.service;

import org.apache.axis2.description.AxisService;
import org.wso2.carbon.rulecep.commons.descriptions.service.ServiceDescription;

/**
 * Creates instances of <code>ServiceEngine<code>
 */
public interface ServiceEngineFactory {

    /**
     * Creates  an instance of <code>ServiceEngine<code>
     *
     * @param serviceDescription information about service
     * @param axisService        axis2 service corresponding to the service engine
     * @param resourceLoader     class loader provides classes and other resource belong to the service engine
     * @return An instance of <code>ServiceEngine</code>
     */
    public ServiceEngine createServiceEngine(ServiceDescription serviceDescription,
                                             AxisService axisService,
                                             ResourceLoader resourceLoader);

}
