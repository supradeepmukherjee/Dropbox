'use client'
import { signUpSchema } from '@/schemas/signUp'
import { useSignUp } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import Link from 'next/link'

const SignUp = () => {
  const router = useRouter()
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { isLoaded, setActive, signUp } = useSignUp()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: ''
    }
  })
  const onSubmit = async (d: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return
    setSubmitting(true)
    setAuthError(null)
    try {
      await signUp.create({
        emailAddress: d.email,
        password: d.password
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setVerifying(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log('signup err', err)
      setAuthError(err?.errors?.[0]?.message || 'an error occured. please try again')
    } finally {
      setSubmitting(false)
    }
  }
  const handleVerification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return
    setSubmitting(true)
    setAuthError(null)
    try {
      const res = await signUp.attemptEmailAddressVerification({ code })
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId })
        router.push('/dashboard')
      } else {
        console.log('verification incomplete', res)
        setVerificationError('Verification couldn\'t be completed')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log('verification err', err)
      setVerificationError(err?.errors?.[0]?.message || 'an error occured. please try again')
    } finally {
      setSubmitting(false)
    }
  }
  if (verifying) return (
    <Card className='w-full max-w-md border border-default-200 bg-default-50 shadow-xl'>
      <CardHeader className='flex flex-col gap-1 items-center pb-2'>
        <h1 className="text-2xl font-bold text-default-900">
          Verify your Email
        </h1>
        <p className="text-default-500 text-center">
          We have sent a verification code to your email
        </p>
      </CardHeader>
      <Divider />
      <CardBody className='py-6'>
        {verificationError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className='h-5 w-5 flex-shrink-0' />
            <p>
              {verificationError}
            </p>
          </div>
        )}
        <form onSubmit={handleVerification} className='space-y-6'>
          <div className="space-y-2">
            <label htmlFor="code" className='text-sm font-medium text-default-900'>
              Verification Code
            </label>
            <Input
              type="text"
              id='code'
              placeholder='Enter 6 digit code'
              value={code}
              onChange={e => setCode(e.target.value)}
              className='w-full'
              autoFocus
            />
          </div>
          <Button type="submit" color='primary' className='w-full' isLoading={submitting}>
            {submitting ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-default-500">
            Did not receive code?
            <button
              className='text-primary hover:underline font-medium'
              onClick={async () => {
                if (signUp) await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })
              }}>
              Resend Code
            </button>
          </p>
        </div>
      </CardBody>
    </Card>
  )
  return (
    <Card className='w-full max-w-md border border-default-200 bg-default-50 shadow-xl'>
      <CardHeader className='flex flex-col gap-1 items-center pb-2'>
        <h1 className="text-2xl font-bold text-default-900">
          Create your Account
        </h1>
        <p className="text-default-500 text-center">
          Sign up to start managing your images securely
        </p>
      </CardHeader>
      <Divider />
      <CardBody className='py-6'>
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className='h-5 w-5 flex-shrink-0' />
            <p>
              {authError}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className="space-y-2">
            <label htmlFor="email" className='text-sm font-medium text-default-900'>
              Email
            </label>
            <Input
              id='email'
              type="email"
              placeholder='desi.emailid@example.com'
              startContent={<Mail className='h-4 w-4 text-default-500' />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register('email')}
              className='w-full'
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className='text-sm font-medium text-default-900'>
              Password
            </label>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='********'
              startContent={<Lock className='h-4 w-4 text-default-500' />}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              endContent={
                <Button onPress={() => setShowPassword(!showPassword)} variant='light' size='sm' type='button' isIconOnly>
                  {showPassword ? <EyeOff className='h-4 w-4 text-default-500' /> : <Eye className='h-4 w-4 text-default-500' />}
                </Button>
              }
              {...register('password')}
              className='w-full'
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className='text-sm font-medium text-default-900'>
              Confirm Password
            </label>
            <Input
              id='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='********'
              startContent={<Lock className='h-4 w-4 text-default-500' />}
              isInvalid={!!errors.passwordConfirmation}
              errorMessage={errors.passwordConfirmation?.message}
              endContent={
                <Button onPress={() => setShowConfirmPassword(!showConfirmPassword)} variant='light' size='sm' type='button' isIconOnly>
                  {showConfirmPassword ? <EyeOff className='h-4 w-4 text-default-500' /> : <Eye className='h-4 w-4 text-default-500' />}
                </Button>
              }
              {...register('password')}
              className='w-full'
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-default-600">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
          <Button type="submit" color='primary' className='w-full' isLoading={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Already have an account?
          <Link href="/sign-in" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default SignUp