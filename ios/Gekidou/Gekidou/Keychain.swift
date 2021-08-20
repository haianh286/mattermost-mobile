//
//  Keychain.swift
//  Gekidou
//
//  Created by Miguel Alatzar on 8/20/21.
//

import Foundation

enum KeychainError: Error {
    case CertificateForIdentityNotFound
    case IdentityNotFound
    case InvalidServerUrl(_ serverUrl: String)
    case InvalidHost(_ host: String)
    case FailedSecIdentityCopyCertificate(_ status: OSStatus)
    case FailedSecItemCopyMatching(_ status: OSStatus)
}

extension KeychainError: LocalizedError {
    var errorCode: Int32? {
        switch self {
        case .CertificateForIdentityNotFound: return -100
        case .IdentityNotFound: return -101
        case .InvalidServerUrl(_): return -106
        case .InvalidHost(_): return -107
        case .FailedSecIdentityCopyCertificate(status: let status): return status
        case .FailedSecItemCopyMatching(status: let status): return status
        }
    }
    
    var errorDescription: String? {
        switch self {
        case .CertificateForIdentityNotFound:
            return "Certificate for idendity not found"
        case .IdentityNotFound:
            return "Identity not found"
        case .InvalidServerUrl(serverUrl: let serverUrl):
            return "Invalid server URL: \(serverUrl)"
        case .InvalidHost(host: let host):
            return "Invalid host: \(host)"
        case .FailedSecIdentityCopyCertificate(status: let status):
            return "Failed to copy certificate: iOS code \(status)"
        case .FailedSecItemCopyMatching(status: let status):
            return "Failed to copy Keychain item: iOS code \(status)"
        }
    }
}

class Keychain {
    static func getClientIdentityAndCertificate(for host: String) throws -> (SecIdentity, SecCertificate)? {
        let query = try buildIdentityQuery(for: host)

        var result: AnyObject?
        let identityStatus = SecItemCopyMatching(query as CFDictionary, &result)
        guard identityStatus == errSecSuccess else {
            if identityStatus == errSecItemNotFound {
                throw KeychainError.IdentityNotFound
            }

            throw KeychainError.FailedSecItemCopyMatching(identityStatus)
        }
        
        let identity = result as! SecIdentity
        var certificate: SecCertificate?
        let certificateStatus = SecIdentityCopyCertificate(identity, &certificate)
        guard certificateStatus == errSecSuccess else {
            throw KeychainError.FailedSecIdentityCopyCertificate(certificateStatus)
        }
        guard certificate != nil else {
            throw KeychainError.CertificateForIdentityNotFound
        }
        
        return (identity, certificate!)
    }
    
    static func getToken(for serverUrl: String) throws -> String? {
        var attributes = try buildTokenAttributes(for: serverUrl)
        attributes[kSecMatchLimit] = kSecMatchLimitOne
        attributes[kSecReturnData] = kCFBooleanTrue
        
        var result: AnyObject?
        let status = SecItemCopyMatching(attributes as CFDictionary, &result)
        let data = result as? Data
        if status == errSecSuccess && data != nil {
            return String(data: data!, encoding: .utf8)
        }
        
        return nil
    }
    
    private static func buildIdentityQuery(for host: String) throws -> [CFString: Any] {
        guard let hostData = host.data(using: .utf8) else {
            throw KeychainError.InvalidHost(host)
        }
        
        let query: [CFString:Any] = [
            kSecClass: kSecClassIdentity,
            kSecAttrLabel: hostData,
            kSecReturnRef: true
        ]

        return query
    }
    
    private static func buildTokenAttributes(for serverUrl: String) throws -> [CFString: Any] {
        guard let serverUrlData = serverUrl.data(using: .utf8) else {
            throw KeychainError.InvalidServerUrl(serverUrl)
        }
        
        var attributes: [CFString: Any] = [
            kSecClass: kSecClassInternetPassword,
            kSecAttrLabel: "token",
            kSecAttrServer: serverUrlData,
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]

        if let accessGroup = Bundle.main.object(forInfoDictionaryKey: "AppGroupIdentifier") as! String? {
            attributes[kSecAttrAccessGroup] = accessGroup
        }
        
        return attributes
    }
}
