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
  type CreateBucketCommandInput,
  CreateBucketCommand,
  type DeleteBucketCommandInput,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  type DeleteObjectsCommandInput,
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

  const { Buckets } = await s3Client.send(command)

  return Buckets
}

export async function createBucket(
  s3Client: S3Client,
  input: CreateBucketCommandInput,
) {
  const command = new CreateBucketCommand(input)

  return s3Client.send(command)
}

export async function deleteBucket(
  s3Client: S3Client,
  input: DeleteBucketCommandInput,
) {
  const command = new DeleteBucketCommand(input)

  return s3Client.send(command)
}

export async function getListObjects(
  s3Client: S3Client,
  input: ListObjectsV2CommandInput,
) {
  const command = new ListObjectsV2Command(input)

  const result = []

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
}

export async function putObject(
  s3Client: S3Client,
  input: PutObjectCommandInput,
) {
  const command = new PutObjectCommand(input)

  return s3Client.send(command)
}

export async function getObject(
  s3Client: S3Client,
  input: GetObjectCommandInput,
) {
  const command = new GetObjectCommand(input)

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
}

export async function deleteObject(
  s3Client: S3Client,
  input: DeleteObjectCommandInput,
) {
  const command = new DeleteObjectCommand(input)

  return s3Client.send(command)
}

export async function deleteObjects(
  s3Client: S3Client,
  input: Partial<DeleteObjectsCommandInput & ListObjectsV2CommandInput>,
) {
  async function recursiveDelete(token?: any) {
    const listCommand = new ListObjectsV2Command({
      Bucket: input.Bucket,
      Prefix: input.Prefix,
      ContinuationToken: token,
    })
    let list = await s3Client.send(listCommand)

    console.log('list', list)

    if (list.KeyCount) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: input.Bucket,
        Delete: {
          Objects: list.Contents!.map((item) => ({ Key: item.Key })),
          Quiet: false,
        },
      })
      let deleted = await s3Client.send(deleteCommand)

      if (deleted.Errors) {
        deleted.Errors.map((error) =>
          console.log(`${error.Key} could not be deleted - ${error.Code}`),
        )
      }
    }

    if (list.NextContinuationToken) {
      return recursiveDelete(list.NextContinuationToken)
    }
  }

  return recursiveDelete()
}
