/*
 * Copyright 2005-2007 WSO2, Inc. (http://wso2.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.carbon.dataservices.ui.beans;

import org.apache.axiom.om.OMAbstractFactory;
import org.apache.axiom.om.OMElement;
import org.apache.axiom.om.OMFactory;

import java.util.ArrayList;
import java.util.List;

/*
 * Represents property elements in config section.
 * eg :
 *   <config>
 *       <property name="org.wso2.ws.dataservice.driver">com.mysql.jdbc.Driver</property>
 *       <property name="org.wso2.ws.dataservice.protocol">jdbc:mysql://localhost:3306/classicmodels</property>
 *       <property name="org.wso2.ws.dataservice.user">sumedha</property>
 *       <property name="org.wso2.ws.dataservice.password">sumedha</property>
 *   </config>  
 */
public class Property extends DataServiceConfigurationElement{
	private String name;
	private Object value;

    public Property(){}
	
	public Property(String name, Object value) {
		this.name = name;
		this.value = value;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Object getValue() {
		return value;
	}
	public void setValue(Object value) {
		this.value = value;
	}

    public OMElement buildXML() {
        OMFactory fac = OMAbstractFactory.getOMFactory();
        OMElement propEl = fac.createOMElement("property", null);
        if (this.getValue() != null) {
            if (this.getValue() instanceof ArrayList) {
                propEl.addAttribute("name", this.getName(), null);

                for (Property p : (List<Property>) this.getValue()) {
                    OMElement propNestedEl = fac.createOMElement("property", null);
                    propNestedEl.addAttribute("name", p.getName(), null);
                    propNestedEl.setText((String) p.getValue());

                    propEl.addChild(propNestedEl);
                }
            } else if (this.getValue() instanceof String) {
                propEl.addAttribute("name", this.getName(), null);
                propEl.setText((String) this.getValue());
            }
        }
        return propEl;
	}
}
