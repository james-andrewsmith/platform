/*
*  Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
package org.wso2.carbon.bam.common.dataobjects.dimensions;

import java.util.Calendar;

public class HourDimension {
	private int id;
    private Calendar startTimestamp;
    private int hour;
    private int dayDim;

    public HourDimension() {}

    public HourDimension(Calendar startTimestamp) {
        this.startTimestamp = startTimestamp;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Calendar getStartTimestamp() {
        return startTimestamp;
    }

    public void setStartTimestamp(Calendar startTimestamp) {
        this.startTimestamp = startTimestamp;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public int getDayDim() {
        return dayDim;
    }

    public void setDayDim(int dayDim) {
        this.dayDim = dayDim;
    }
}