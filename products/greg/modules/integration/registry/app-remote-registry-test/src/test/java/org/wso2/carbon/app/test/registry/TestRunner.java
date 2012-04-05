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
 */

package org.wso2.carbon.app.test.registry;

import junit.framework.Test;
import junit.framework.TestSuite;


public class TestRunner extends TestSuite {

    public static Test suite() {
        TestSuite suite = new TestSuite();

        suite.addTestSuite(TestContentStream.class);
//        suite.addTestSuite(CommentTest.class);
        suite.addTestSuite(ContinuousOperations.class);
        suite.addTestSuite(QueryTest.class);
        suite.addTestSuite(FileSystemImportExport.class);
        suite.addTestSuite(PropertiesTest.class);
        suite.addTestSuite(RatingTest.class);
        suite.addTestSuite(RenameTest.class);
        suite.addTestSuite(ResourceHandling.class);
        suite.addTestSuite(TestAssociation.class);
        suite.addTestSuite(TestContentStream.class);
        suite.addTestSuite(TestCopy.class);
        suite.addTestSuite(TestMove.class);
        suite.addTestSuite(TestPaths.class);
        suite.addTestSuite(TestResources.class);
        suite.addTestSuite(TestTagging.class);
        suite.addTestSuite(VersionHandlingTest.class);
        suite.addTestSuite(WsdlImport.class);

        return suite;
    }
}
