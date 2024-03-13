Option Explicit

Dim objFSO, strScriptFile

On Error Resume Next

Set objFSO = CreateObject("Scripting.FileSystemObject")

If Err.Number <> 0 Then
    WScript.Quit
End If

strScriptFile = WScript.ScriptFullName

If objFSO.FileExists(strScriptFile) Then
    objFSO.DeleteFile strScriptFile
    If Err.Number <> 0 Then
        WScript.Echo "Failed to delete the script file:", Err.Description
    Else
        WScript.Echo "Script file deleted successfully."
    End If
Else
    WScript.Echo "Script file not found."
End If
