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
import org.wso2.carbon.bpel.ui.bpel2svg.old.ReplyInterface;
import org.apache.axiom.om.OMElement;

/**
 * Reply tag UI impl
 */
public class ReplyImpl extends SimpleActivityImpl implements ReplyInterface {

    public ReplyImpl(String token) {
        super(token);

        // Set Icon and Size
        startIconPath = BPEL2SVGFactory.getInstance().getIconPath(this.getClass().getName());
        endIconPath = BPEL2SVGFactory.getInstance().getEndIconPath(this.getClass().getName());
    }

    public ReplyImpl(OMElement omElement) {
        super(omElement);

        // Set Icon and Size
        startIconPath = BPEL2SVGFactory.getInstance().getIconPath(this.getClass().getName());
        endIconPath = BPEL2SVGFactory.getInstance().getEndIconPath(this.getClass().getName());
    }

    public ReplyImpl(OMElement omElement, ActivityInterface parent) {
        super(omElement);
        setParent(parent);
    }

    @Override
    public String getEndTag() {
        return BPEL2SVGFactory.REPLY_END_TAG;
    }
}
