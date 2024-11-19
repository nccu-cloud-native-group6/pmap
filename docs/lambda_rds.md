## Connect RDS in lambda using RDS IAM

在 lambda 中透過 IAM 認證方式（不用輸入密碼）連線到 RDS 的前置作業紀錄

- RDS 和 lambda 要在同一個 VPC 中
- 不用開 RDS proxy（要錢）也能用

### 前置作業

- 1. RDS 要設定 `Database authentication` -> `Password and IAM database authentication`
  - Ref: [https://repost.aws/knowledge-center/rds-mysql-access-denied](https://repost.aws/knowledge-center/rds-mysql-access-denied)

- 2. IAM 裡增加 policy：`rds-db:connect`，也要讓執行 lambda 的 role 有這個 policy
  - 如果 policy 有指定允許的 user name ，要跟下一個步驟的 user name 一樣
  - Ref: [https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html)

例如，用 AWS console 增加 policy：
![add-policy.png](https://i.imgur.com/TITFx5e.png)

再用 cdk code 定義 lambda 的 role 擁有該 policy：
```ts
    const customRole = new Role(this, 'customRole', {
      roleName: 'customRole',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
          ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
          // 增加剛才設定的 rds-db:connect policy，使用 arn 指定
          ManagedPolicy.fromManagedPolicyArn(this, id, "arn:aws:iam::[acoount_id]:policy/rds-iam-connect"),
      ]
    });
    
    // 定義一個 lambda function
    const weatherComputeFunction = new NodejsFunction(this, 'function', {
      vpc: vpc, // 需要和 RDS 在同一個 VPC 中
      // .... 
      role: customRole, // 指定 role
    });

```

- 3. DB 增加 IAM user
  - Ref: [https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.DBAccounts.html](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.DBAccounts.html)
```sql
// 增加一個 user 叫 lambda_user 
CREATE USER 'lambda_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS'; 
GRANT ALL ON your_database.* TO lambda_user@`%`;
```


之後 lambda 就可以用 IAM 方式連接 RDS（不需密碼而是使用 token）
  - Ref and code: [https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/services-rds.html#rds-connection](https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/services-rds.html#rds-connection)
