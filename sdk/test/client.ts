import { LinkEmailDto } from 'sdk/src/dto/link-email.dto'
import { UserIdentityClient } from '../src'
import { Password2fa, ResetPasswordBody } from '../src/dto'

async function testClient() {
	const tokenId =
		'eyJhbGciOiJSUzI1NiIsImtpZCI6ImY4MDljZmYxMTZlNWJhNzQwNzQ1YmZlZGE1OGUxNmU4MmYzZmQ4MDUiLCJ0eXAiOiJKV1QifQ.eyJpc0VuYWJsZVR3b0ZhY3RvciI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3JhcmUtZ3VpZGUtMzUyMDAyIiwiYXVkIjoicmFyZS1ndWlkZS0zNTIwMDIiLCJhdXRoX3RpbWUiOjE2NjkwMjM0NjQsInVzZXJfaWQiOiJuaXFSNEQ2WGZTWFdSYnlYUzVXVHNUQVJCeEEyIiwic3ViIjoibmlxUjRENlhmU1hXUmJ5WFM1V1RzVEFSQnhBMiIsImlhdCI6MTY2OTAyMzQ2NCwiZXhwIjoxNjY5MDI3MDY0LCJlbWFpbCI6ImhheWNodXllbmNob2FuaEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiaGF5Y2h1eWVuY2hvYW5oQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.Kgq0W04bGSDRQ0Wd3OZ9-Y0P5DHR_VGpOxXa3a5jUMlfnFb2HtMbrLNOAYSCXlLu5pv9Fh0oCoReDIpKtaxXxT30exG97bxGdZ8gLp_lm6Z97Ct7z02PBfZp2AZcwTPD-1CH5kVgS6fu_rcYGi6UrOmD1IRvle2pXVoPbin-ma0OJs2pyIGDPru6BlhMrd3LAtJyQvG8RpGO52oDuC9OtSxqEDm5lTPDv3Ysjr0GXXW5sFoEozuGxZlBY_KpfwOunWUU7MfVpgi86xL2QQzTmmhVKkiuIC24e-eIswoTs484vPgEtAvzK21LJkBIJOap8IJWB-srfENbzSOzKAkJDg'
	const userClientIdentity = new UserIdentityClient()

	userClientIdentity.setTokenId(tokenId)

	//Send email forgot password
	const forgotResp = await userClientIdentity.forgotPassword('avis@coinhe.io')
	console.log(JSON.stringify(forgotResp))

	//Reset password
	const resetPasswordBody: ResetPasswordBody = {
		token: 'qprjcnv1',
		newPassword: 'A2@11a',
	}
	const resetResp = await userClientIdentity.resetPassword(resetPasswordBody)
	console.log(JSON.stringify(resetResp))

	//Change password
	const changePwdResp = await userClientIdentity.changePassword({
		oldPassword: 'Chtlab@1234',
		newPassword: 'Chtlab@123',
	})
	console.log(changePwdResp)

	// Create secret 2fa
	const secret = await userClientIdentity.createQrCodeAndSecretKey()
	console.log(secret)

	// Enable 2fa
	const body: Password2fa = {
		password: 'Hi@123',
		twoFactorCode: 'c4DkEvSWl0NyYhiH3CBuJ5Qv2VfkrU',
	}
	const enable2faResp = await userClientIdentity.turnOff2fa(body)
	console.log(enable2faResp)

	// Disable 2fa
	const disable2faResp = await userClientIdentity.turnOff2fa(body)
	console.log(disable2faResp)

	// Verify and get token 2fa
	const token = await userClientIdentity.getTokenTwoFactor({ tfaCode: '569860' })
	console.log(token)

	// Get json web key
	const jwks = await userClientIdentity.getJsonWebKeys()
	console.log(jwks)

	//verify token
	const userFromToken = await userClientIdentity.verifyToken()
	console.log(userFromToken)

	//verify email
	const verifyEmailResp = await userClientIdentity.sendCodeVerifyEmail('monday@gmail.com')
	console.log(verifyEmailResp)

	//link mail
	const bodyLinkMail: LinkEmailDto = {
		code: '454412',
		email: 'monday@gmail.com',
		password: 'A2@11a',
	}
	const linkMailResp = await userClientIdentity.linkEmail(bodyLinkMail)
	console.log(linkMailResp)
}

testClient().catch(console.error)
