// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs'
import path from 'path';

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
	// Define a default configuration
	const defaultConfig: LightmouseKeywordConfiguration = {
		"groupName": "",
		"pattern": [],
		"textColor": "",
		"bold": false,
		"italic": false,
		"underline": false,
		"strikethrough": false
	}
	// Get the existing configuration
	const LightMouseConfig = vscode.workspace.getConfiguration("lightmouse");
	const keywordConfigurations: LightmouseKeywordConfiguration[] = LightMouseConfig.get("keywordConfigurations") || [defaultConfig]
	updateTokenColors(keywordConfigurations)
	updateGrammars(context, keywordConfigurations)
	vscode.window.setStatusBarMessage("Lightmouse is now active.", 2000)

	// Create listeners for when the user saves changes Lightmouse settings in their settings.json
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration("lightmouse")) {
				// Draw a info window asking the user to reload and apply changes.
				vscode.window.showInformationMessage("Lightmouse settings have changed. Reload window to apply changes?", "Reload Window")
					.then(selection => {
						if (selection === "Reload Window") {
							updateTokenColors(keywordConfigurations)
							updateGrammars(context, keywordConfigurations)
							vscode.commands.executeCommand('workbench.action.reloadWindow')
						}
					})
			}
		})
	)
}

// This method is called when your extension is deactivated
export function deactivate() {
	removeTokenColors()
}

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
			"scope": `keyword.lightmouse.${c.groupName}`,
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
		// Remove any previous rules we may have created from this list, but leave anyone else's rules.
		"textMateRules": [...currentRules.filter((rule) => rule.scope.split(".")[1] !== "lightmouse"), ...newTokenRules]
	}

	// Only update if our settings have changed
	if (JSON.stringify(currentRules) !== JSON.stringify(tokenRules)) {
		config.update('tokenColorCustomizations', tokenRules, vscode.ConfigurationTarget.Global)
	}
}

function updateGrammars(context: vscode.ExtensionContext, config: LightmouseKeywordConfiguration[]) {
	// Read in syntaxes folder as an array of fps..?
	const syntaxPath = path.join(context.extensionPath, "src", "syntaxes")
	const grammarFiles = fs.readdirSync(syntaxPath)
	const grammarPaths = grammarFiles.map(file => {
		return path.join(syntaxPath, file)
	});

	// TODO: Type this
	const propertiesMap = new Map()

	config.forEach(c => {
		propertiesMap.set(c.groupName, c.pattern)
	})

	// For each fp, we need to read the patterns array
	grammarPaths.forEach(fp => {
		// open the JSON file:
		let grammar: GrammarConfiguration = JSON.parse(fs.readFileSync(fp, { encoding: "utf-8" }))
		// for each grammar file, overwrite the existing settings to do what we want.
		grammar.patterns = config.map(cfg => {
			return {
				name: `keyword.lightmouse.${cfg.groupName}`,
				match: `\\b(${cfg.pattern.join("|")})\\b`
			}
		})
		fs.writeFileSync(fp, JSON.stringify(grammar))
	})
}

function removeTokenColors() {
	// Get the current TextMate Rules config
	const config = vscode.workspace.getConfiguration('editor')
	const tokenColorConfig = config.get('tokenColorCustomizations') || {}
	const currentRules: TextMateRuleConfiguration[] = config.get("tokenColorCustomizations.textMateRules") || []

	const tokenRules = {
		...tokenColorConfig, "textMateRules": [...currentRules.filter(rule => !rule.scope.includes("lightmouse"))]
	}

	if (JSON.stringify(currentRules) !== JSON.stringify(tokenRules)) {
		config.update("tokenColorCustomizations", tokenRules, vscode.ConfigurationTarget.Global)
	}

}