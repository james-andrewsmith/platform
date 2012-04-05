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
package org.wso2.carbon.rule.service.admin;

import org.apache.axiom.om.OMElement;
import org.apache.axis2.description.AxisService;
import org.apache.axis2.engine.AxisConfiguration;
import org.wso2.carbon.rulecep.commons.descriptions.service.ServiceDescription;

import javax.activation.DataHandler;

/**
 * Handler for executing rule service management operations for rule services
 * based on various types of rule service artifacts
 */
public interface RuleServiceAdminHandler {

    /**
     * Add a new rule service or update an existing one
     *
     * @param axisConfiguration      Axis2 Environment configuration
     * @param axisService            AxisService instance
     * @param ruleServiceDescription information about the rule service
     */
    public void saveRuleService(AxisConfiguration axisConfiguration,
                                AxisService axisService,
                                ServiceDescription ruleServiceDescription);

    /**
     * Retrieves an XML representation of the rule service
     *
     * @param axisConfiguration Axis2 Environment configuration
     * @param serviceName       The name of the service to be retrieved
     * @return an XML representation of the rule service
     */
    public OMElement getRuleService(AxisConfiguration axisConfiguration, String serviceName);

    /**
     * Uploads the facts to be used in the rule service
     *
     * @param axisConfiguration Axis2 Environment configuration
     * @param serviceName       The name of the service that facts are belonged
     * @param fileName          fact file name
     * @param dataHandler       Binary representation of the facts
     * @return A list of uploaded facts
     */
    public String[] uploadFacts(AxisConfiguration axisConfiguration,
                                String serviceName,
                                String fileName,
                                DataHandler dataHandler);

    /**
     * Uploads the rule script for a rule service
     *
     * @param axisConfiguration Axis2 Environment configuration
     * @param serviceName       the name of the rule service
     * @param fileName          the rule script file name
     * @param dataHandler       Binary representation of the rule script
     */
    public void uploadRuleFile(AxisConfiguration axisConfiguration,
                               String serviceName,
                               String fileName,
                               DataHandler dataHandler);

    /**
     * Retrieves the all facts applicable for a rule service
     *
     * @param axisConfiguration Axis2 Environment configuration
     * @param serviceName       the name of the rule service
     * @return A list of the facts
     */
    public String[] getAllFacts(AxisConfiguration axisConfiguration, String serviceName);
}
