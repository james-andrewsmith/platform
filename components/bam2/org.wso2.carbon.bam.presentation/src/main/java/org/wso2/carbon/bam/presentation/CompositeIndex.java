/**
 * Copyright (c) 2009, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.bam.presentation;

public class CompositeIndex {

    private String indexName;
    private String rangeFirst;
    private String rangeLast;

    public CompositeIndex(String indexName, String rangeFirst, String rangeLast) {
        this.indexName = indexName;
        this.rangeFirst = rangeFirst;
        this.rangeLast = rangeLast;
    }

    // Needed for Axis2 data binding when used as web service call return
    public CompositeIndex() {

    }

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
    }

    public String getRangeFirst() {
        return rangeFirst;
    }

    public void setRangeFirst(String rangeFirst) {
        this.rangeFirst = rangeFirst;
    }

    public String getRangeLast() {
        return rangeLast;
    }

    public void setRangeLast(String rangeLast) {
        this.rangeLast = rangeLast;
    }

}
