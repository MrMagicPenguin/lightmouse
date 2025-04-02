// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { log } from 'console';
import * as vscode from 'vscode';

type colorConfiguration = {
	operator: string,
	color: string
}

type textMateRuleConfiguration = {
	scope: string,
	settings: {
		foreground?: string,
		fontStyle?: string
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "lightmouse" is active!');
	// Get configuration
	const config = vscode.workspace.getConfiguration("lightmouse");
	const criticalKeywordConfig: colorConfiguration = config.get('criticalColors') || {operator:"", color:""}
	// const editorConfig = vscode.workspace.getConfiguration('editor')
	// const currentTokenColors = editorConfig.get('tokenColorCustomizations')
	//console.log(JSON.stringify(criticalKeywordConfig))

	updateTokenColors(criticalKeywordConfig)

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

function updateTokenColors(keywordConfig: colorConfiguration) {
	// Get our editor's existing settings, which we will add to.
	const editorConfig = vscode.workspace.getConfiguration('editor')
	const currentTokenColors = editorConfig.get('tokenColorCustomizations') || {}

	// Create Color rules based on the config we pass in.
	//TODO Make this a generated array based on config.
	const todoRules = [
			{
				"scope": keywordConfig.operator,
				"settings": {
					"foreground": keywordConfig.color
				}
			}
		]
	
	const newTokenColors = {
		// Start with all current TokenColorCustomization configurations,
		// Remove any previous rules we may have created from this list as we will add out own.
		...currentTokenColors,
		"textMateRules": todoRules
	}
	console.log("Current: " + JSON.stringify(currentTokenColors))
	console.log("New: " + JSON.stringify(newTokenColors))
	

	// Only update if our settings have changed
	if (JSON.stringify(currentTokenColors) !== JSON.stringify(newTokenColors)){
		console.log("Updating Editor Config...")
		editorConfig.update('tokenColorCustomizations', newTokenColors, vscode.ConfigurationTarget.Global)
	}

	console.log
	
	
}