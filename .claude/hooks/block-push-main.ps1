# PreToolUse-Hook: blockiert git push auf main (Bash- und PowerShell-Tool).
# Exit 2 + stderr = Block mit Begruendung, Exit 0 = kein Einwand.

$eingabe = [Console]::In.ReadToEnd() | ConvertFrom-Json
$befehl = $eingabe.tool_input.command
if (-not $befehl) { exit 0 }

function Blockiere($grund) {
    [Console]::Error.WriteLine("Blockiert: $grund Laut CLAUDE.md nie direkt auf main pushen - neuen Branch anlegen und per Pull Request mergen.")
    exit 2
}

# Jeden git-push-Teilbefehl einzeln pruefen (auch in && / ; / | Ketten)
foreach ($treffer in [regex]::Matches($befehl, '\bgit\b[^;&|\r\n]*?\bpush\b([^;&|\r\n]*)')) {
    $tokens = $treffer.Groups[1].Value -split '\s+' | Where-Object { $_ }
    $positional = @($tokens | Where-Object { $_ -notmatch '^-' })

    if ($tokens -contains '--all' -or $tokens -contains '--mirror') {
        Blockiere 'git push --all/--mirror wuerde auch main pushen.'
    }

    # positional[0] = Remote, ab [1] = Refspecs
    $refspecs = @($positional | Select-Object -Skip 1)
    foreach ($ref in $refspecs) {
        if ($ref -match '^\+?([^:]*:)?(refs/heads/)?main$') {
            Blockiere "git push nennt main als Ziel ($ref)."
        }
    }

    # Ohne Ziel gilt der aktuelle Branch
    if ($refspecs.Count -eq 0) {
        $verzeichnis = if ($eingabe.cwd) { $eingabe.cwd } else { (Get-Location).Path }
        $aktuell = git -C $verzeichnis branch --show-current
        if ($aktuell -eq 'main') {
            Blockiere 'git push ohne Ziel auf dem Branch main.'
        }
    }
}

exit 0
