# -*- coding: utf-8 -*-
from __future__ import print_function
import os, sys
import oss2
#
# 百分比显示回调函数
#
def percentage(consumed_bytes, total_bytes):
    if total_bytes:
        rate = int(100 * (float(consumed_bytes) / float(total_bytes)))
        print('\r{0}% '.format(rate), end=filePath)
        sys.stdout.flush()
 
# 脚本需要传入5个参数
if ( len(sys.argv) > 5 ):
    AccessKeyId     = sys.argv[1]
    AccessKeySecret = sys.argv[2]
    Endpoint        = sys.argv[3] 
    Bucket          = sys.argv[4]
    filePath = sys.argv[5]
    fileName = filePath.split("/")[-1]
 
else:
    print("Example: %s AccessKeyId AccessKeySecret Endpoint Bucket /data/backup.zip" % sys.argv[0])
    exit()
 
# OSS认证并开始上传
auth = oss2.Auth(AccessKeyId , AccessKeySecret)
bucket = oss2.Bucket(auth,  Endpoint, Bucket)
oss2.resumable_upload(bucket, fileName, filePath, progress_callback=percentage)
print('\rUpload %s to OSS Success!' % filePath)