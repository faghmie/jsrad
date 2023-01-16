<?php
	include_once '../external/PHPMailer_v5.1/class.phpmailer.php';
	include_once '../config.php';
	include_once '../common.php';
	//----------------------------------------------------------------------
	$request = @explode('/', trim($_SERVER['PATH_INFO'],'/'));
		
	// Call function based on HTTP method
	
	switch ($method) {
	  case 'GET':
		exit_with_response(-1, 'Request not supported: '.$method);
		break;
	  case 'PUT':
		exit_with_response(-1, 'Request not supported: '.$method);
		break;
	  case 'POST':
		send_email($obj); break;
	  case 'DELETE':
		exit_with_response(-1, 'Request not supported: '.$method);
		break;
	}
	
	function send_email($obj){
		global $Config;
		$request = $obj;
		date_default_timezone_set('Africa/Johannesburg');
		
		if (is_array($request->to))
			$email_to = implode(";", $request->to);
		else
			$email_to = $request->to;
		
		$date = date("d F Y H:i:s");
		$file_body = <<<EOT
				<b>To: </b>{$email_to}<br/>
				<b>Subject: </b>{$request->subject}<br/>
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
		
		file_put_contents($base.$request->subject.".html",$file_body);
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
		$mail->From = $Config["SUPPORT_EMAIL"]; 	//do NOT fake header.
		$mail->FromName = $Config["PRODUCT_NAME"];
		$mail->AddReplyTo($Config["SUPPORT_EMAIL"], "Support and Help"); //optional

		$mail->IsHTML(true);
		if (is_array($request->to)){
			foreach($request->to as $add){
				$mail->AddAddress($add); // Email on which you want to send mail
			}
		}
		else
			$mail->AddAddress($request->to); // Email on which you want to send mail

		$mail->Subject = $request->subject;

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
