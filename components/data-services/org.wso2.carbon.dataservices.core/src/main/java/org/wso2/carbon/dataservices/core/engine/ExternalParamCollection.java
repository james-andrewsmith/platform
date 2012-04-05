/*
 *  Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.wso2.carbon.dataservices.core.engine;

import java.util.HashMap;
import java.util.Map;

import org.wso2.carbon.dataservices.common.DBConstants;

/**
 * Represents a collection of ExternalParam objects.
 */
public class ExternalParamCollection {

	/**
	 * External parameters
	 */
	private Map<String, ExternalParam> entries;
	
	/**
	 * Temp params used for situations such as, default values etc..
	 */
	private Map<String, ParamValue> tmpEntries;
	
	public ExternalParamCollection() {
		this.entries = new HashMap<String, ExternalParam>();
		this.tmpEntries = new HashMap<String, ParamValue>();
	}
	
	public Map<String, ExternalParam> getEntries() {
		return entries;
	}
	
	public Map<String, ParamValue> getTempEntries() {
		return tmpEntries;
	}
	
	public void addParam(ExternalParam param) {
		this.getEntries().put(param.getType() + ":" + param.getName(), param);
	}
	
	public void addTempParam(String name, ParamValue value) {
		this.getTempEntries().put(name, value);
	}
	
	public ParamValue getTempParam(String name) {
		return this.getTempEntries().get(name);
	}
	
	public void clearTempValues() {
		this.getTempEntries().clear();
	}
	
	public ExternalParam getParam(String type, String name) {
		return this.getEntries().get(type + ":" + name);
	}

    public ExternalParam getParam(String name) {
        ExternalParam param = this.getParam(DBConstants.DBSFields.QUERY_PARAM, name);
        if (param == null) {
            param = this.getParam(DBConstants.DBSFields.COLUMN, name);
        }
        return param;
    }
	
}
