<?php
	include_once '../external/PHPMailer_v5.1/class.phpmailer.php';
	include_once '../config.php';
	include_once '../common.php';
	//----------------------------------------------------------------------
	$request = @explode('/', trim($_SERVER['PATH_INFO'],'/'));
		
	// Call function based on HTTP method
	
	switch ($method) {
	  case 'GET':
		feedback_list($obj);
		break;
	  case 'PUT':
	  case 'POST':
		feedback_log($obj);
		//feedback_email($obj); 
		break;
	  case 'DELETE':
		exit_with_response(-1, 'Request not supported: '.$method);
		break;
	}
	
	function feedback_log($obj){
		$db = open_auth_db();
		
		$res = $db->exec("INSERT INTO feedback(email, relates_to, message, created_on, status) VALUES(".
				"'". $obj->auth_token->email. "',".
				"'". $obj->relates_to. "',".
				"'". $obj->body. "',".
				"CURRENT_TIMESTAMP, 'CREATED')");
		
		if (0 == $res){
			exit_with_response(-1, "Could not log your feedback");
		}
		
		exit_with_response();
	}
	
	function feedback_list($obj){
		$db = open_auth_db();
		
		//USERS
		$rst = $db->query("SELECT users.thumbnail, feedback.* FROM feedback JOIN users ON users.email = feedback.email ORDER BY created_on ASC");

		$result = [];
		if ($rst !== false){
			while ($row = $rst->fetch(PDO::FETCH_ASSOC)) {
				$result[] = [
					'image_url' => $row['thumbnail'],
					'text' => $row['message'],
					'sub_text' => $row['email'],
					'submit_date' => $row['created_on']
				];
			}
		}
		exit_with_response(null, null, $result);
	}
	
	function feedback_email($obj){
		global $Config;
		$request = $obj;
		date_default_timezone_set('Africa/Johannesburg');
		
		$email_to = $Config['SUPPORT_EMAIL'];
		$email_from = $obj->auth_token->email;
		
		$date = date("d F Y H:i:s");
		$file_body = <<<EOT
				<b>To: </b>{$email_to}<br/>
				<b>From: </b>{$email_from}<br/>
				<b>Subject: </b>Feedback - {$request->relates_to}<br/>
				<b>Sent on: </b>{$date}<br/>
				<hr/>
				{$request->body}
EOT;
		$base = './temp/';
		
		if (!file_exists($base)){
			if (!mkdir($base)){
				exit_with_response(-1, 'No place to store notification');
			}
		}
		
		file_put_contents($base."Feedback.html",$file_body);
		//return;
		ob_start();
		
		$mail = new PHPMailer();
		$mail->IsSMTP(); // set mailer to use SMTP
		$mail->SMTPDebug = 0;
		$mail->SMTPAuth = true; // turn on SMTP authentication
		$mail->Host = $Config["SMTP_SERVER"]; // specify main and backup server

		$mail->Port = $Config["SMTP_PORT"];
		$mail->Username = $Config["SMTP_USERNAME"]; // SMTP username
		$mail->Password = $Config["SMTP_PASSWORD"]; // SMTP password
		$mail->From = $email_from; 	//do NOT fake header.
		$mail->FromName = $Config["PRODUCT_NAME"];
		$mail->AddReplyTo($Config["SUPPORT_EMAIL"], "Support and Help"); //optional

		$mail->IsHTML(true);
		$mail->AddAddress($email_to); // Email on which you want to send mail

		$mail->Subject = "Feedback - ".$request->relates_to;

		$mail->Body = $request->body;
		
		
		$send = $mail->Send();
		ob_end_clean();
		
		if(!$send){
			//exit_with_response(-1, var_export($_GLOBALS, true));
			exit_with_response(-1, $mail->ErrorInfo. var_export($Config['SMTP_SERVER'], true));
		}
		
		exit_with_response();
	}
	
	
?>
