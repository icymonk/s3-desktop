import {
  S3,
  type S3ClientConfig,
  ListObjectsV2Command,
  S3Client,
  ListBucketsCommand,
  type ListObjectsV2CommandInput,
  GetObjectCommand,
  type GetObjectCommandInput,
  type DeleteObjectCommandInput,
  DeleteObjectCommand,
  type PutObjectCommandInput,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import {
  CloudFrontClient,
  type CloudFrontClientConfig,
} from '@aws-sdk/client-cloudfront'

export function getS3Client(s3ClientConfig: S3ClientConfig) {
  const client = new S3(s3ClientConfig) as S3 & { accessKey: string }

  // @ts-ignore
  client.accessKey = s3ClientConfig.credentials.accessKeyId
  // @ts-ignore
  client.secretKey = s3ClientConfig.credentials.secretAccessKey

  return client
}

export function getCfClient(cfConfig: CloudFrontClientConfig) {
  return new CloudFrontClient(cfConfig)
}

export async function getBuckets(s3Client: S3Client) {
  const command = new ListBucketsCommand({})

  try {
    const { Buckets } = await s3Client.send(command)

    return Buckets
  } catch (err) {
    console.error(err)
  }
}

export async function getListObjects(
  s3Client: S3Client,
  input: ListObjectsV2CommandInput,
) {
  const command = new ListObjectsV2Command(input)

  const result = []

  try {
    let isTruncated = true

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken, CommonPrefixes } =
        await s3Client.send(command)

      isTruncated = !!IsTruncated
      console.log('Contents', {
        input,
        Contents,
        CommonPrefixes,
      })

      if (Contents) result.push(...Contents)
      if (CommonPrefixes)
        result.push(
          ...CommonPrefixes.map((item) => ({
            ...item,
            Key: item.Prefix,
            isDirectory: true,
          })),
        )

      command.input.ContinuationToken = NextContinuationToken
    }

    return result
  } catch (err) {
    console.error(err)
  }
}

export async function putObject(
  s3Client: S3Client,
  input: PutObjectCommandInput,
) {
  const command = new PutObjectCommand(input)

  try {
    const response = await s3Client.send(command)
    return response
  } catch (err) {
    console.error(err)
  }
}

export async function getObject(
  s3Client: S3Client,
  input: GetObjectCommandInput,
) {
  const command = new GetObjectCommand(input)

  try {
    const response = await s3Client.send(command)
    const byteArray = await response.Body!.transformToByteArray()
    const blob = new Blob([byteArray], { type: 'application/octet-stream' })

    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = input.Key?.toString() || ''
    document.body.append(anchor)
    anchor.click()

    document.body.removeChild(anchor)
    console.log(blob)
  } catch (err) {
    console.error(err)
  }
}

export async function deleteObject(
  s3Client: S3Client,
  input: DeleteObjectCommandInput,
) {
  const command = new DeleteObjectCommand(input)

  try {
    const response = await s3Client.send(command)
    return response
  } catch (err) {
    console.error(err)
  }
}
