/*
   Copyright 2010 Gregor Latuske

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
*/
package org.wso2.carbon.bpel.ui.bpel2svg.latest.internal.svg.segment;

import org.wso2.carbon.bpel.ui.bpel2svg.latest.internal.svg.settings.Position;

/**
 * This class represents an arrow segment.
 *
 * @author Gregor Latuske
 */
public class Arrow
	extends Segment {

	/**
	 * Constructor of Arrow.
	 *
	 * @param cssClass The CSS class of the arrow.
	 * @param arrowHead The arrow head of the arrow.
	 * @param positions The array of position the arrow is printed through.
	 */
	protected Arrow(String cssClass, String arrowHead, Position... positions) {
		super();

		append("<path d=\"");

		for (int i = 0; i < positions.length; i++) {
			if (i == 0) {
				append("M ");
			} else {
				append("L ");
			}

			append(positions[i].getX() + "," + positions[i].getY() + " ");
		}

		append("\" class=\"" + cssClass + "\" ");
		append("style=\"marker-end:url(#" + arrowHead + ")\"/>\n");
	}

	/**
	 * Constructor of Arrow.
	 *
	 * @param positions The array of position the arrow is printed through.
	 */
	public Arrow(Position... positions) {
		this("arrow", "ah", positions);
	}

}
