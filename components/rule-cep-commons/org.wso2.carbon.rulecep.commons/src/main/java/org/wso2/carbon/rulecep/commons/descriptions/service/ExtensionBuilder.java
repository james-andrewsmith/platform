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

import org.apache.axiom.om.OMElement;
import org.wso2.carbon.rulecep.commons.descriptions.XPathFactory;

/**
 * Build the extensions for a particular configuration element. This is required when there are
 * multiple ways of specifying a single configuration information in XML. E.g rule set in
 * rule service and rule mediator
 */
public interface ExtensionBuilder {

    /**
     * Build the extensible configuration parts of the given <code>ExtensibleConfiguration</code>
     *
     * @param extensibleConfiguration <code> ExtensibleConfiguration</code> instance
     * @param element                 source OMElement containing the configuration
     * @param xPathFactory            the factory to create XPaths
     */
    public void build(ExtensibleConfiguration extensibleConfiguration,
                      OMElement element,
                      XPathFactory xPathFactory);
}
