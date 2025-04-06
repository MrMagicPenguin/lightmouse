# lightmouse 

Comment Syntax Highlighter. Spiritual re-write of [Aaron Bond's Better Comments](https://github.com/aaron-bond/better-comments) to learn how to write VSC Extensions, and to play with TypeScript.

## Features

Format specific words within comments with fun colors and typical text formatting including _italics_, **bold**, ~~strikethrough~~ and <ins>underlines</ins>. As well as any hex-color.

## Extension Settings
This extension contributes the setting:
**lightmouse.keywordConfigurations**
For each group of keywords you want to modify the formatting of, you can include a new object describing the formatting, as well as the specific keywords to look for.

For example:
``` json
    "lightmouse.keywordConfigurations": [
        {
            "groupName": "critical",
            "pattern": [
                "URGENT",
                "IMPORTANT",
                "CRITICAL"
            ],
            "textColor": "#FF0000",
            "backgroundColor": "transparent",
            "italic": false,
            "bold": true,
            "underline": false,
            "strikethrough": true
        },
    ],
```

`groupName`: The name of the collection of keywords injected to the TextMate Grammar system.
`pattern` : An array of string values that are identified as a TextMate 'Scope' to be formatted.
`textColor` : A Hex Color to format the keyword text with
`backgroundColor`: The HexColor to format the highlighted text with.
`italic`: A boolean value if the text should be italicized or not
`bold`: A boolean value if the text should be bolded or not
`underline`: A boolean value if the text should be underlined or not
`strikethrough`: A boolean value if the text should stricken through or not.

## Known Issues

* Background Text is not currently supported.

## Release Notes

### 1.0.0
* Initial Release

Initial release of lightmouse.

---
