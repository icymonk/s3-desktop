# 시작하기

1. [S3 Desktop 설치](https://github.com/icymonk/s3-desktop/releases)

2. AWS > IAM > Users

   ![AWS_IAM_USERS](/AWS_IAM_USERS.png){data-zoomable}

3. 사용자 생성

   ![AWS_CREATE_USER_1](/AWS_CREATE_USER_1.png){data-zoomable}

4. 권한 정책 추가 "AmazonS3FullAccess"

   ![AWS_CREATE_USER_2](/AWS_CREATE_USER_2.png){data-zoomable}

5. 사용자 상세 페이지로 이동

6. 액세스 키 생성
   ![AWS_CREATE_ACCESS_KEY](/AWS_CREATE_ACCESS_KEY.png){data-zoomable}

7. S3 Desktop에 Workspace 추가

   ![ADD_WORKSPACE](/ADD_WORKSPACE.png){data-zoomable}

<script setup>
import { onMounted } from 'vue';
import mediumZoom from 'medium-zoom';

onMounted(() => {
  mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' });
});
</script>

<style>
.medium-zoom-overlay {
  z-index: 20;
}

.medium-zoom-image {
  z-index: 21;
}
</style>
