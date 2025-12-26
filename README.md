# Deploy Guard
<hr>

## About Deploy Guard
Deploy Guard is a pre-deploy environment validation API that prevents bad deployments caused by misconfigured environment variables.

## Problem
Modern web applications often rely on environment variables for configuration, secrets and runtime behavior. In most production environment, production incidents often occur due to misconfigured or missing environment variables during deployment.

Common failure cases include required variables not being set, staging or debug flags accidentally enabled in production, invalid configuration values, or environment drift between local, CI, and production systems.

While CI pipelines are good at testing code, they typically lack explicit, enforceable rules around environment configuration. Teams rely on documentation, conventions, or manual checks, which do not scale and are easy to bypass under pressure.

DeployGuard addresses this gap by introducing a pre-deployment validation step that enforces environment configuration rules and fails the deployment early when violations are detected

## How it Works
<ol>
<li> User creates project and defines environment schema</li>
<li> CI pipelines sends env metadata to DeployGuard</li>
<li> DeployGuard validates env metadata against schema</li>
<li> DeployGuard returns validation results to CI pipeline</li>
<li> CI pipeline fails deployment if validation fails</li>
</ol>

## API Overview
Please refer to the [API documentation](https://deploy-guard.com/docs/api) for more details.

## Validation Rules
DeployGuard validates environment variables against a predefined schema. The schema defines the expected format, type, and constraints for each variable. DeployGuard supports various validation rules, including:

1. Required variables
Ensures all required environment variables are present.
```json
    "required": ["DATABASE_URL", "SECRET_KEY"]
```
2. Forbidden variables
Ensures certain variables are not present in the target environment
```json
    "forbidden": ["DEBUG", "STAGING"]
```
3. Allowed values
Ensures certain variables have allowed values
```json
    "allowed": {
        "ENVIRONMENT": ["production", "staging", "development"]
    }
```
4. Pattern Matching (Regrex)
validates variable values against a regular expression
```json
    "pattern": {
        "DATABASE_URL": "^postgres://"
    }
```

## Example GitHub Action 
```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Validate environment configuration
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NODE_ENV: production
        run: |
          RESPONSE=$(curl -s -X POST https://api.deployguard.dev/projects/PROJECT_ID/validate \
            -H "Authorization: Bearer ${{ secrets.DEPLOYGUARD_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "environment": "production",
              "variables": {
                "DATABASE_URL": "'"$DATABASE_URL"'",
                "JWT_SECRET": "'"$JWT_SECRET"'",
                "NODE_ENV": "'"$NODE_ENV"'"
              }
            }')

          echo "DeployGuard response:"
          echo "$RESPONSE"

          STATUS=$(echo "$RESPONSE" | jq -r '.status')

          if [ "$STATUS" != "pass" ]; then
            echo "Environment validation failed. Blocking deployment."
            exit 1
          fi

      - name: Deploy
        run: |
          echo "Deployment step would run here"
```

## Known Limitations
- DeployGuard does not support validating environment variables that are not explicitly defined in the configuration.
- No schema versioning support.
- No webhook notifications.
- Single tenant assumption.

## Future Plans
- Support for validating environment variables that are not explicitly defined in the configuration.
- Schema versioning support.
- Webhook notifications.
- Multi-tenant support.
- Web dashboard
- Slack alerts
- Email notifications

## Why This Project was built
This project was built as a focused exercise in shipping a production-grade application with rich CI integration.

## License
MIT License

Copyright (c) 2023 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.