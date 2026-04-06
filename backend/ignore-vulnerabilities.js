const { exec } = require('child_process');

exec('npm audit --json', (err, stdout, stderr) => {
    if (err && stderr) {
        console.error(`exec error: ${err}`);
        console.error(`stderr: ${stderr}`);
        process.exit(1);
        return;
    }

    try {
        const audit = JSON.parse(stdout);
        const ignoreVulnerabilities = [
            'GHSA-h6q6-9hqw-rwfv',
            'GHSA-crh6-fp67-6883',
            'GHSA-5fg8-2547-mr8q' 
        ];

        const filteredVulnerabilities = {};
        let totalIgnored = 0;

        for (const [key, value] of Object.entries(audit.vulnerabilities)) {
            const shouldIgnore = value.via.some(via =>
                typeof via === 'string' ? ignoreVulnerabilities.includes(via) : ignoreVulnerabilities.includes(via.source)
            );

            if (!shouldIgnore) {
                filteredVulnerabilities[key] = value;
            } else {
                totalIgnored += 1;
            }
        }

        if (totalIgnored > 0) {
            console.log(`Ignored ${totalIgnored} vulnerabilities`);
        }

        const filteredAuditReport = {
            ...audit,
            vulnerabilities: filteredVulnerabilities,
            metadata: {
                ...audit.metadata,
                vulnerabilities: {
                    ...audit.metadata.vulnerabilities,
                    total: Object.keys(filteredVulnerabilities).length
                }
            }
        };

        console.log(JSON.stringify(filteredAuditReport, null, 2));
    } catch (parseError) {
        console.error(`Failed to parse audit output: ${parseError.message}`);
        console.error(stdout);
        process.exit(1);
    }
});