/*
 * Copyright (c) 2008, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.registry.governance.api.test;

import org.apache.axiom.om.OMElement;
import org.apache.commons.io.IOUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.wso2.carbon.governance.api.exception.GovernanceException;
import org.wso2.carbon.governance.api.schema.SchemaFilter;
import org.wso2.carbon.governance.api.schema.SchemaManager;
import org.wso2.carbon.governance.api.schema.dataobjects.Schema;
import org.wso2.carbon.registry.core.Registry;
import org.wso2.carbon.registry.core.exceptions.RegistryException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

public class SchemaTestCase {

    private Registry registry;

    @BeforeClass(groups = {"wso2.greg"})
    public void initTest() {
        registry = TestUtils.getRegistry();
        try {
            TestUtils.cleanupResources(registry);
        } catch (RegistryException e) {
            e.printStackTrace();
            Assert.fail("Unable to run Governance API tests: " + e.getMessage());
        }
    }

    @Test(groups = {"wso2.greg"})
    public void testAddSchema() throws Exception {
        SchemaManager schemaManager = new SchemaManager(registry);

        Schema schema = schemaManager.newSchema("http://svn.wso2.org/repos/wso2/trunk/graphite/components/governance/org.wso2.carbon.governance.api/src/test/resources/test-resources/xsd/purchasing.xsd");
        schema.addAttribute("creator", "it is me");
        schema.addAttribute("version", "0.01");
        schemaManager.addSchema(schema);

        Schema newSchema = schemaManager.getSchema(schema.getId());
        Assert.assertEquals(schema.getSchemaElement().toString(),
                newSchema.getSchemaElement().toString());
        Assert.assertEquals("it is me", newSchema.getAttribute("creator"));
        Assert.assertEquals("0.01", newSchema.getAttribute("version"));

        // change the target namespace and check
        String oldSchemaPath = newSchema.getPath();
        Assert.assertEquals(oldSchemaPath, "/trunk/schemas/org/bar/purchasing/purchasing.xsd");
        Assert.assertTrue(registry.resourceExists("/trunk/schemas/org/bar/purchasing/purchasing.xsd"));

        OMElement schemaElement = newSchema.getSchemaElement();
        schemaElement.addAttribute("targetNamespace", "http://ww2.wso2.org/schema-test", null);
        schemaElement.declareNamespace("http://ww2.wso2.org/schema-test", "tns");
        schemaManager.updateSchema(newSchema);

        Assert.assertEquals("/trunk/schemas/org/wso2/ww2/schema_test/purchasing.xsd", newSchema.getPath());
        Assert.assertFalse(registry.resourceExists("/trunk/test_schemas/org/bar/purchasing.xsd"));

        // doing an update without changing anything.
        schemaManager.updateSchema(newSchema);

        Assert.assertEquals("/trunk/schemas/org/wso2/ww2/schema_test/purchasing.xsd", newSchema.getPath());
        Assert.assertEquals("0.01", newSchema.getAttribute("version"));

        newSchema = schemaManager.getSchema(schema.getId());
        Assert.assertEquals("it is me", newSchema.getAttribute("creator"));
        Assert.assertEquals("0.01", newSchema.getAttribute("version"));

        Schema[] schemas = schemaManager.findSchemas(new SchemaFilter() {
            public boolean matches(Schema schema) throws GovernanceException {
                if (schema.getAttribute("version").equals("0.01")) {
                    return true;
                }
                return false;
            }
        });
        Assert.assertEquals(2, schemas.length);
        Assert.assertEquals(newSchema.getId(), schemas[0].getId());

        // deleting the schema
        schemaManager.removeSchema(newSchema.getId());
        Schema deletedSchema = schemaManager.getSchema(newSchema.getId());
        Assert.assertNull(deletedSchema);
    }

    @Test(groups = {"wso2.greg"})
    public void testAddSchemaFromContent() throws Exception {
        SchemaManager schemaManager = new SchemaManager(registry);
        byte[] bytes = null;
        try {
            InputStream inputStream = new URL("http://svn.wso2.org/repos/wso2/trunk/graphite/components/governance/org.wso2.carbon.governance.api/src/test/resources/test-resources/xsd/purchasing.xsd").openStream();
            try {
                bytes = IOUtils.toByteArray(inputStream);
            } finally {
                inputStream.close();
            }
        } catch (IOException e) {
            Assert.fail("Unable to read WSDL content");
        }
        Schema schema = schemaManager.newSchema(bytes, "newPurchasing.xsd");
        schema.addAttribute("creator", "it is me");
        schema.addAttribute("version", "0.01");
        schemaManager.addSchema(schema);

        Schema newSchema = schemaManager.getSchema(schema.getId());
        Assert.assertEquals(schema.getSchemaElement().toString(),
                newSchema.getSchemaElement().toString());
        Assert.assertEquals("it is me", newSchema.getAttribute("creator"));
        Assert.assertEquals("0.01", newSchema.getAttribute("version"));

        // change the target namespace and check
        String oldSchemaPath = newSchema.getPath();
        Assert.assertEquals(oldSchemaPath, "/trunk/schemas/org/bar/purchasing/newPurchasing.xsd");
        Assert.assertTrue(registry.resourceExists("/trunk/schemas/org/bar/purchasing/newPurchasing.xsd"));
    }

    @Test(groups = {"wso2.greg"})
    public void testAddSchemaFromContentNoName() throws Exception {
        SchemaManager schemaManager = new SchemaManager(registry);
        byte[] bytes = null;
        try {
            InputStream inputStream = new URL("http://svn.wso2.org/repos/wso2/trunk/graphite/components/governance/org.wso2.carbon.governance.api/src/test/resources/test-resources/xsd/purchasing.xsd").openStream();
            try {
                bytes = IOUtils.toByteArray(inputStream);
            } finally {
                inputStream.close();
            }
        } catch (IOException e) {
            Assert.fail("Unable to read WSDL content");
        }
        Schema schema = schemaManager.newSchema(bytes);
        schema.addAttribute("creator", "it is me");
        schema.addAttribute("version", "0.01");
        schemaManager.addSchema(schema);

        Schema newSchema = schemaManager.getSchema(schema.getId());
        Assert.assertEquals(schema.getSchemaElement().toString(),
                newSchema.getSchemaElement().toString());
        Assert.assertEquals("it is me", newSchema.getAttribute("creator"));
        Assert.assertEquals("0.01", newSchema.getAttribute("version"));

        // change the target namespace and check
        String oldSchemaPath = newSchema.getPath();
        Assert.assertEquals(oldSchemaPath, "/trunk/schemas/org/bar/purchasing/" + schema.getId() + ".xsd");
        Assert.assertTrue(
                registry.resourceExists("/trunk/schemas/org/bar/purchasing/" + schema.getId() + ".xsd"));
    }
}
