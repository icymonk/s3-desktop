# Getting Started

1. [Install S3 Desktop](https://github.com/icymonk/s3-desktop/releases)

2. AWS > IAM > Users

   ![AWS_IAM_USERS](/AWS_IAM_USERS.png){data-zoomable}

3. Create User

   ![AWS_CREATE_USER_1](/AWS_CREATE_USER_1.png){data-zoomable}

4. Add Permission Policy "AmazonS3FullAccess"

   ![AWS_CREATE_USER_2](/AWS_CREATE_USER_2.png){data-zoomable}

5. Go to User Detail Page

6. Create Access Key
   ![AWS_CREATE_ACCESS_KEY](/AWS_CREATE_ACCESS_KEY.png){data-zoomable}

7. Add Workspace to S3 Desktop

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
