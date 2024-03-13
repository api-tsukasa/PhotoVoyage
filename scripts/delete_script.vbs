Set objFSO = CreateObject("Scripting.FileSystemObject")
strScriptFile = objFSO.GetParentFolderName(WScript.ScriptFullName) & "\dependencies.bat"
objFSO.DeleteFile strScriptFile
