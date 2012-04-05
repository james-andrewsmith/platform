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

package org.wso2.carbon.bpel.ui.bpel2svg.old.impl;

import org.wso2.carbon.bpel.ui.bpel2svg.old.ActivityInterface;
import org.wso2.carbon.bpel.ui.bpel2svg.old.BPEL2SVGFactory;
import org.apache.axiom.om.OMElement;
import org.wso2.carbon.bpel.ui.bpel2svg.old.CompensationHandlerInterface;

/**
 * CompensateHandler tag UI impl
 */
public class CompensationHandlerImpl extends SequenceImpl implements CompensationHandlerInterface {
    public CompensationHandlerImpl(String token) {
        super(token);

        name = "COMPENSATIONHANDLER" + System.currentTimeMillis();
        displayName = "Compensation Handler";

        // Set Icon and Size
        startIconPath = BPEL2SVGFactory.getInstance().getIconPath(this.getClass().getName());
        endIconPath = BPEL2SVGFactory.getInstance().getEndIconPath(this.getClass().getName());
    }

    public CompensationHandlerImpl(OMElement omElement) {
        super(omElement);

        name = "COMPENSATIONHANDLER" + System.currentTimeMillis();
        displayName = "Compensation Handler";

        // Set Icon and Size
        startIconPath = BPEL2SVGFactory.getInstance().getIconPath(this.getClass().getName());
        endIconPath = BPEL2SVGFactory.getInstance().getEndIconPath(this.getClass().getName());
    }
    
    public CompensationHandlerImpl(OMElement omElement, ActivityInterface parent) {
        super(omElement);
        setParent(parent);
        name = "COMPENSATIONHANDLER" + System.currentTimeMillis();
        displayName = "Compensation Handler";

        // Set Icon and Size
        startIconPath = BPEL2SVGFactory.getInstance().getIconPath(this.getClass().getName());
        endIconPath = BPEL2SVGFactory.getInstance().getEndIconPath(this.getClass().getName());
    }

    @Override
    public String getEndTag() {
        return BPEL2SVGFactory.COMPENSATIONHANDLER_END_TAG;
    }

}
