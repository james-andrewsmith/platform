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

package org.wso2.carbon.registry.jcr.query.qom;

import javax.jcr.query.qom.FullTextSearch;
import javax.jcr.query.qom.StaticOperand;


public class RegistryFullTextSearch implements FullTextSearch {

    String selectorName = "";
    String propertyName = "";
    StaticOperand fullTextSearchExpression = null;

    public RegistryFullTextSearch(String selectorName,
                                  String propertyName,
                                  StaticOperand fullTextSearchExpression) {

        this.selectorName = selectorName;
        this.propertyName = propertyName;
        this.fullTextSearchExpression = fullTextSearchExpression;

    }

    public String getSelectorName() {

        return selectorName;
    }

    public String getPropertyName() {

        return propertyName;
    }

    public StaticOperand getFullTextSearchExpression() {

        return fullTextSearchExpression;
    }
}
