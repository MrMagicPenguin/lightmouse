// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { log } from 'console';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "lightmouse" is active!');
	// Get configuration
	const config = vscode.workspace.getConfiguration("Lightmouse");
	const criticalKeywordConfig = config.get('criticalColors')
	console.log("hello")

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('lightmouse.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from LightMouse!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function updateTokenColors(config: vscode.WorkspaceConfiguration) {
	// Get our editor's existing settings, which we will add to.
	const editorConfig = config.getConfiguration('editor')
	const currentTokenColors = editorConfig.get('tokenColorCustomizations')

	const todoRules = [
			{
				"scope": "keyword.operator",
				"settings": {
					"foreground": "#FF0000"
				}
			}
		]
}