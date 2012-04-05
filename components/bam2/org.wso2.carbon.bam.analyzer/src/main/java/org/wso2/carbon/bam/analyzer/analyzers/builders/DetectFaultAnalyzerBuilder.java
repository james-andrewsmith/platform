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
package org.wso2.carbon.bam.analyzer.analyzers.builders;


import org.apache.axiom.om.OMAttribute;
import org.apache.axiom.om.OMElement;
import org.wso2.carbon.bam.analyzer.analyzers.AnalyzerBuilder;
import org.wso2.carbon.bam.analyzer.analyzers.AnalyzerConfig;
import org.wso2.carbon.bam.analyzer.analyzers.DetectFaultAnalyzer;
import org.wso2.carbon.bam.analyzer.analyzers.configs.DetectFaultConfig;
import org.wso2.carbon.bam.analyzer.engine.Analyzer;
import org.wso2.carbon.bam.analyzer.engine.AnalyzerConfigConstants;
import org.wso2.carbon.bam.analyzer.engine.AnalyzerException;

import java.util.Arrays;
import java.util.List;

public class DetectFaultAnalyzerBuilder extends AnalyzerBuilder {

    @Override
    protected AnalyzerConfig buildConfig(OMElement analyzerXML) throws AnalyzerException {
        OMAttribute errorFields = analyzerXML.getAttribute(AnalyzerConfigConstants.errorFields);
        OMAttribute currentSequenceIdentifier = analyzerXML.getAttribute(
                AnalyzerConfigConstants.currentSequenceIdentifier);
        DetectFaultConfig detectFaultsConfig = new DetectFaultConfig();
        if (errorFields != null) {
            List<String> errorFieldsValues = Arrays.asList(errorFields.getAttributeValue().split(
                    AnalyzerConfigConstants.DETECT_FAULTS_ERROR_FIELDS_SPLITTER));
            detectFaultsConfig.setErrorFields(errorFieldsValues);
        }
        if(currentSequenceIdentifier!=null){
            detectFaultsConfig.setCurrentSequenceIdentifier(currentSequenceIdentifier.getAttributeValue().trim());
        }
        return detectFaultsConfig;
    }

    @Override
    public Analyzer buildAnalyzer(OMElement analyzerXML) throws AnalyzerException {
        return new DetectFaultAnalyzer(buildConfig(analyzerXML));
    }
}
