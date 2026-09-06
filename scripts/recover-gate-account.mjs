import { parseArgs } from 'node:util'
import pg from 'pg'
const { values } = parseArgs({ options: { 'user-id': { type: 'string' }, 'gate-subject': { type: 'string' }, ticket: { type: 'string' }, operator: { type: 'string' }, verified: { type: 'boolean' }, apply: { type: 'boolean' } } })
const uid = Number(values['user-id']), subject = values['gate-subject']
if (!Number.isSafeInteger(uid) || uid <= 0 || !subject || !values.ticket || !values.operator || !values.verified) throw new Error('Required: --user-id ID --gate-subject SUBJECT --ticket REFERENCE --operator NAME --verified; preview by default, --apply commits the verified binding.')
if ([subject, values.ticket, values.operator].some(value => value.length > 255)) throw new Error('Arguments must be at most 255 characters')
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
 await client.query('BEGIN')
 await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`subject:${subject}`])
 const { rows: [user] } = await client.query('SELECT id, gate_user_id, deleted_at FROM users WHERE id = $1 FOR UPDATE', [uid])
 if (!user || user.deleted_at) throw new Error('Only active local accounts can be recovered')
 if (user.gate_user_id && user.gate_user_id !== subject) throw new Error('Account already belongs to another Gate identity')
 const other = await client.query('SELECT id FROM users WHERE gate_user_id = $1 AND id <> $2', [subject, uid])
 if (other.rowCount) throw new Error('Gate identity is already bound; recovery never merges or transfers accounts')
 if (!values.apply) {
  await client.query('ROLLBACK')
  console.info(JSON.stringify({ action: 'account.recovery.preview', userId: uid, gateSubject: subject, ticket: values.ticket }))
 } else {
  await client.query('UPDATE users SET gate_user_id = $1, gate_provisioned_at = NULL, updated_at = now() WHERE id = $2', [subject, uid])
  await client.query('INSERT INTO account_recovery_audit (user_id, gate_user_id, ticket, operator) VALUES ($1, $2, $3, $4)', [uid, subject, values.ticket, values.operator])
  await client.query('COMMIT')
  console.info(JSON.stringify({ action: 'account.recovery.complete', userId: uid, gateSubject: subject, ticket: values.ticket }))
 }
} catch (error) { await client.query('ROLLBACK'); throw error }
finally { await client.end() }
