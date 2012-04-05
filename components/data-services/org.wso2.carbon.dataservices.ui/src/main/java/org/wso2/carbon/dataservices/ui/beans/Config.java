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
import org.wso2.carbon.dataservices.common.DBConstants;
import org.wso2.carbon.dataservices.common.DBConstants.*;

import java.util.ArrayList;
import java.util.Iterator;

public class Config extends DataServiceConfigurationElement {

    private String id;

    private ArrayList<Property> properties = new ArrayList<Property>();

    private String dataSourceType;

    public ArrayList<Property> getProperties() {
        return properties;
    }

    public void setProperties(ArrayList<Property> properties) {
        this.properties = properties;
    }

    public void addProperty(Property property) {
        addProperty(property.getName(), property.getValue());
    }

    public void addProperty(String name, Object value) {
        Property property = new Property(name, value);
        properties.add(property);
        setDatasourceType(name);
    }

    public void removeProperty(Property propertyName) {
        properties.remove(propertyName);
    }

    public void removeProperty(String propertyName) {
        Property property = new Property();
        for (int a = 0; a < properties.size(); a++) {
            property = properties.get(a);
            if (property.getName().equals(propertyName)) {
                removeProperty(property);
            }
        }

    }

    private void setDatasourceType(String propertyName) {
        if (RDBMS.DRIVER.equals(propertyName) || RDBMS.XA_DATASOURCE_CLASS.equals(propertyName)) {
            for (int i =0; i < properties.size(); i ++) {
                if (properties.get(i).getName().equals(RDBMS.DRIVER)
                        && properties.get(i).getValue().toString().equals("org.apache.cassandra.cql.jdbc.CassandraDriver")) {
                    dataSourceType = DataSourceTypes.CASSANDRA;
                    break;
                } else {
                    dataSourceType = DataSourceTypes.RDBMS;
                }
            }
        } else if (CSV.DATASOURCE.equals(propertyName)) {
            dataSourceType = DataSourceTypes.CSV;
        } else if (Excel.DATASOURCE.equals(propertyName)) {
            dataSourceType = DataSourceTypes.EXCEL;
        } else if (RDF.DATASOURCE.equals(propertyName)) {
            dataSourceType = DataSourceTypes.RDF;
        } else if (SPARQL.DATASOURCE.equals(propertyName)) {
            dataSourceType = DataSourceTypes.SPARQL;
        } else if (DBConstants.JNDI.PROVIDER_URL.equals(propertyName)) {
            dataSourceType = DataSourceTypes.JNDI;
        } else if (GSpread.DATASOURCE.equals(propertyName)) {
            dataSourceType = DataSourceTypes.GDATA_SPREADSHEET;
        } else if (DBConstants.CarbonDatasource.NAME.equals(propertyName)) {
            dataSourceType = DataSourceTypes.CARBON;
        } else if (DBConstants.WebDatasource.WEB_CONFIG.equals(propertyName)) {
            dataSourceType = DataSourceTypes.WEB;
        }
    }

    public void updateProperty(String name, Object value) {
        Iterator<Property> propertyItr = properties.iterator();
        for (; propertyItr.hasNext();) {
            Property property = propertyItr.next();
            if (property.getName().equals(name)) {
                if (value != null) {
                    property.setValue(value);
                } else {
                    property.setValue("");
                }
                setDatasourceType(name);
            }

        }
    }

    public void updatePropertyName(String name, String value) {
        Iterator<Property> propertyItr = properties.iterator();
        Property property = propertyItr.next();
        if (!property.getName().equals(name)) {
            properties.remove(property);
            Property newProperty = new Property(name, value);
            properties.add(newProperty);
        }
        setDatasourceType(name);
    }

    public Object getPropertyValue(String propertyName) {
        Iterator<Property> propertyItr = properties.iterator();
        for (; propertyItr.hasNext();) {
            Property property = propertyItr.next();
            if (property.getName().equals(propertyName)) {
                return property.getValue();
            }
        }
        return null;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDataSourceType() {
        return dataSourceType;
    }

    public OMElement buildXML() {
        OMFactory fac = OMAbstractFactory.getOMFactory();
        OMElement confEl = fac.createOMElement("config", null);
        if (this.getId() != null) {
            confEl.addAttribute("id", this.getId(), null);
        }
        /* build properties */
        Iterator<Property> iterator = this.getProperties().iterator();
        while (iterator.hasNext()) {
            Property property = iterator.next();
            confEl.addChild(property.buildXML());
        }
        return confEl;
    }
}
