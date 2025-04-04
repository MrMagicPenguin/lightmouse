// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { group, log } from 'console';
import { json } from 'stream/consumers';
import * as vscode from 'vscode';
import fs from 'fs'
import path from 'path';

type StringDict = {
	[group: string]: string
}
type LightmouseKeywordConfiguration = {
	groupName: string,
	pattern: string[],
	textColor: string,
	bold: boolean,
	italic: boolean,
	underline: boolean,
	strikethrough: boolean
}

type TextMateRuleConfiguration = {
	scope: string,
	settings: {
		foreground?: string,
		fontStyle?: string
	}
}
type GrammarPattern = {
	name: string,
	match: string
}
type GrammarConfiguration = {
	scopeName: string,
	injectionSelector: string,
	patterns: GrammarPattern[]
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "lightmouse" is active!');

	// Get the existing configuration.
	// The defaults and shape have been contributed to it through `package.json`.
	const LightMouseConfig = vscode.workspace.getConfiguration("lightmouse");

	const defaultConfig: LightmouseKeywordConfiguration = {
		"groupName": "",
		"pattern": [],
		"textColor": "",
		"bold": false,
		"italic": false,
		"underline": false,
		"strikethrough": false
	}
	const keywordConfigurations: LightmouseKeywordConfiguration[] = LightMouseConfig.get("keywordConfigurations") || [defaultConfig]

	// Collect our Keyword Groups, Keywords, and Colors.
	updateTokenColors(keywordConfigurations)
	updateGrammars(context, keywordConfigurations)

	// The command has been defined in the package.json file
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('lightmouse.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		vscode.window.showInformationMessage('Hello World from LightMouse!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function updateTokenColors(cfg: LightmouseKeywordConfiguration[]) {
	// Build a string of font style flags from the configuration object
	// NOTE: Can be nested in below object?
	const tokenFontStyles = cfg.map(c => {
		let tokenStyle = []
		c.bold ? tokenStyle.push("bold") : ""
		c.italic ? tokenStyle.push("italic") : ""
		c.underline ? tokenStyle.push("underline") : ""
		c.strikethrough ? tokenStyle.push("strikethrough") : ""

		return tokenStyle.join(" ")
	})


	const newTokenRules: TextMateRuleConfiguration[] = cfg.map((c, i) => {
		return {
			"scope": `lightmouse.keyword.${c.groupName}`,
			"settings": {
				"foreground": c.textColor ? c.textColor : "",
				"fontStyle": tokenFontStyles[i]
			}
		}
	})

	// Get our editor's existing settings, which we will add to.
	const config = vscode.workspace.getConfiguration('editor')
	const tokenColorConfig = config.get('tokenColorCustomizations') || {}
	const currentRules: TextMateRuleConfiguration[] = config.get("tokenColorCustomizations.textMateRules") || []


	const tokenRules = {
		...tokenColorConfig,
		// Start with all current TokenColorCustomization configurations,
		// Remove any previous rules we may have created from this list as we will add our own.
		"textMateRules": [...currentRules.filter((rule) => rule.scope.split(".")[0] !== "lightmouse"), ...newTokenRules]
	}



	// Only update if our settings have changed
	if (JSON.stringify(currentRules) !== JSON.stringify(tokenRules)) {
		console.log("Updating Editor Config...")
		config.update('tokenColorCustomizations', tokenRules, vscode.ConfigurationTarget.Global)
	}
}

function updateGrammars(context: vscode.ExtensionContext, cfg: LightmouseKeywordConfiguration[]) {
	// Read in syntaxes folder as an array of fps..?
	const syntaxPath = path.join(context.extensionPath, "src", "syntaxes")
	const grammarFiles = fs.readdirSync(syntaxPath)
	const grammarPaths = grammarFiles.map(file => {
		return path.join(syntaxPath, file)
	});

	// For each fp, we need to read the patterns array
	grammarPaths.forEach(fp => {
		// open the JSON file:
		let grammar: GrammarConfiguration = JSON.parse(fs.readFileSync(fp, { encoding: "utf-8" }))
		// Check if the scope already exists in this grammar:
		// foreach grammar.patterns as p:
		// if p.name is in 
		// Update the "match" if the list is different
		// write it back to the file
		// otherwise, create a new pattern and write it back to the file in the syntaxes folder.
	})

	// either update the existing 'match' value, or create a new Name/Match object.
	// Then, write it all back to the syntaxes folder.
	// NOTE: This might need to happen during startup?
}

// function groupConfigurations(kwGroups: StringDict, cfgKeywordGroups: Record<string, string[]>)
// 1. Collect all user defined configurations from Config :check:
// 2. Update TextMate color rules override :check:
// 3. Update keyword-injection(s)