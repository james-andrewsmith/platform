package org.wso2.carbon.hostobjects.file;

import org.wso2.carbon.scriptengine.exceptions.ScriptException;

import java.io.InputStream;
import java.io.OutputStream;

public interface JavaScriptFile {

    public void construct() throws ScriptException;

    public void open(String mode) throws ScriptException;

    public void close() throws ScriptException;

    public String readLine() throws ScriptException;

    public void writeLine(String data) throws ScriptException;

    public String read(long count) throws ScriptException;

    public void write(String data) throws ScriptException;

    public String readAll() throws ScriptException;

    public boolean move(String dest) throws ScriptException;

    public boolean del() throws ScriptException;

    public long getLength() throws ScriptException;

    public long getLastModified() throws ScriptException;

    public String getName() throws ScriptException;

    public boolean isExist() throws ScriptException;

    public InputStream getInputStream() throws ScriptException;

    public OutputStream getOutputStream() throws ScriptException;

    public String getContentType() throws ScriptException;
}
