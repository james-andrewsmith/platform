/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.commons.vfs2.provider.ftps;

import org.apache.commons.vfs2.FileName;
import org.apache.commons.vfs2.FileSystem;
import org.apache.commons.vfs2.FileSystemConfigBuilder;
import org.apache.commons.vfs2.FileSystemException;
import org.apache.commons.vfs2.FileSystemOptions;
import org.apache.commons.vfs2.provider.GenericFileName;
import org.apache.commons.vfs2.provider.URLFileName;
import org.apache.commons.vfs2.provider.ftp.FtpFileProvider;
import org.apache.commons.vfs2.provider.ftp.FtpFileSystem;

import java.util.StringTokenizer;

/**
 * A provider for FTP file systems.
 *
 * NOTE: Most of the heavy lifting for FTPS is done by the org.apache.commons.vfs2.provider.ftp package since
 * they both use commons-net package
 *
 * @author <a href="http://commons.apache.org/vfs/team-list.html">Commons VFS team</a>
 * @version $Revision: 480428 $ $Date: 2006-11-29 07:15:24 +0100 (Mi, 29 Nov 2006) $
 * @since 2.0
 */
public class FtpsFileProvider extends FtpFileProvider
{
    public FtpsFileProvider()
    {
        super();
    }

    /**
     * Creates the filesystem.
     */
    @Override
    protected FileSystem doCreateFileSystem(final FileName name, final FileSystemOptions fileSystemOptions)
        throws FileSystemException
    {
        // Create the file system
        final GenericFileName rootName = (GenericFileName) name;

        FileSystemOptions opts = new FileSystemOptions();

        if (name instanceof URLFileName) {

            if (fileSystemOptions != null) {
                opts = fileSystemOptions;
            }
            String queryString = ((URLFileName) name).getQueryString();
            if (queryString != null) {
                FtpsFileSystemConfigBuilder cfgBuilder = FtpsFileSystemConfigBuilder.getInstance();
                StringTokenizer st = new StringTokenizer(queryString, "?&!=");
                while (st.hasMoreTokens()) {
                    if (PASSIVE_MODE.equalsIgnoreCase(st.nextToken()) &&
                            st.hasMoreTokens() && "true".equalsIgnoreCase(st.nextToken())) {
                        cfgBuilder.setPassiveMode(opts, true);
                    }
                }
            }
        }

        FtpsClientWrapper ftpClient = new FtpsClientWrapper(rootName, opts);

        return new FtpFileSystem(rootName, ftpClient, fileSystemOptions);
    }

    @Override
    public FileSystemConfigBuilder getConfigBuilder()
    {
        return FtpsFileSystemConfigBuilder.getInstance();
    }
}
