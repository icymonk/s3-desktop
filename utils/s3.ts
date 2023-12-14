import {
  S3,
  type S3ClientConfig,
  ListObjectsV2Command,
  S3Client,
  ListBucketsCommand,
  type ListObjectsV2CommandInput,
  GetObjectCommand,
  type GetObjectCommandInput,
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

export async function getObject(
  s3Client: S3Client,
  input: GetObjectCommandInput,
) {
  const command = new GetObjectCommand(input)

  try {
    const response = await s3Client.send(command)
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
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

//   // 인스턴스 초기화
//   const s3Client = new S3({
//     apiVersion: "2015-04-13",
//     region: "ap-northeast-2",
//     credentials: {
//       accessKeyId: accKey,
//       secretAccessKey: secretKey,
//     },
//   })

//   const cfClient = new CloudFrontClient({
//     apiVersion: "2020-05-31",
//     region: "ap-northeast-2",
//     credentials: {
//       accessKeyId: accKey,
//       secretAccessKey: secretKey,
//     },
//   })

//   const bucketNameCD =
//     env === 'prod'
//       ? `extension.calsplatz.com`
//       : `${env}.extension.calsplatz.com`

//   const originDomain =
//     env === 'prod'
//       ? `${appCode}.calsplatz.com`
//       : `${env}.${appCode}.calsplatz.com`

//   const timeStamp = `${new Date(+new Date() + 3240 * 10000)
//     .toISOString()
//     .replace('T', ' ')
//     .replace(/\..*/, '')
//     .replace(' ', '')
//     .replace(/-/g, '')
//     .replace(/:/g, '')}`
//   let distributionId = ''

//   // 파일업로드
//   await recursiveUpload(
//     s3Client,
//     distPath,
//     `extension/${appCode}`,
//     slash(bucketNameCD),
//   )

//   // 무효화
//   const listDisCmd = new ListDistributionsCommand({})
//   const listDisCmdResult = await cfClient.send(listDisCmd)

//   if (listDisCmdResult.DistributionList?.Items?.length) {
//     for (let i = 0; i < listDisCmdResult.DistributionList.Items.length; i++) {
//       const disItem = listDisCmdResult.DistributionList.Items[i]
//       const domain = disItem.Aliases?.Items?.[0]

//       if (domain === originDomain) {
//         distributionId = disItem.Id || ''
//         break
//       }
//     }
//   }
//   console.log(`Start CreateInvalidation: ${distributionId}`)

//   if (distributionId.length > 0) {
//     const invalidateCmd = new CreateInvalidationCommand({
//       DistributionId: distributionId,
//       InvalidationBatch: {
//         CallerReference: timeStamp,
//         Paths: {
//           Quantity: 1,
//           Items: [`/extension/${appCode}/*`],
//         },
//       },
//     })

//     const invalidateCmdResult = await cfClient.send(invalidateCmd)

//     console.log(`WaitFor waitUntilInvalidationCompleted: ${distributionId}`)
//     const wairfor = await waitUntilInvalidationCompleted(
//       {
//         client: cfClient,
//         maxWaitTime: 300,
//       },
//       {
//         Id: invalidateCmdResult.Invalidation?.Id,
//         DistributionId: distributionId,
//       },
//     )

//     console.log(`Finish CreateInvalidation: ${wairfor.state}`)
//   } else {
//     console.error(`DistributionId Empty`)
//   }
//   console.info('Finish')
// }

// async function recursiveUpload(client, dirPath, targetFolderPath, bucketName) {
//   const files = fs.readdirSync(dirPath)

//   for (const fileName of files) {
//     const filePath = path.join(dirPath, fileName)

//     const stat = await fs.statSync(filePath)
//     if (stat.isFile()) {
//       // upload file
//       const readBuffer = await fs.readFileSync(filePath)
//       console.log(
//         `Upload : ${filePath} => ${slash(
//           path.join(targetFolderPath, fileName),
//         )}`,
//       )
//       const param = {
//         Bucket: bucketName,
//         Key: slash(path.join(targetFolderPath, fileName)),
//         Body: readBuffer,
//         // ACL: 'public-read',
//         ContentType: mime.lookup(filePath).toString(),
//       }

//       await client.send(new PutObjectCommand(param)).catch((e) => {
//         if (e) {
//           console.error(e)
//         }
//         return false
//       })
//     } else if (stat.isDirectory()) {
//       await recursiveUpload(
//         client,
//         filePath,
//         path.join(targetFolderPath, fileName),
//         bucketName,
//       )
//     }
//   }

//   return true
// }
