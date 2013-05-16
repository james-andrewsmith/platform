package org.wso2.carbon.transport.adaptor.manager.core;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/*
* Copyright 2004,2005 The Apache Software Foundation.
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
*/public class TransportAdaptorPropertyConfiguration {

    private Map<String,String> propertyList;

    public Map<String, String> getPropertyList() {
        return propertyList;
    }

    public void setPropertyList(Map<String, String> propertyList) {
        this.propertyList = propertyList;
    }

    public TransportAdaptorPropertyConfiguration(){
        this.propertyList = new ConcurrentHashMap<String, String>();
    }

    public void addTransportAdaptorProperty(String name, String value) {
        this.propertyList.put(name, value);
    }

}