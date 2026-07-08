package kr.remerge.stylehub.domain.wishlist;

import kr.remerge.stylehub.domain.wishlist.dto.WishlistDto;
import kr.remerge.stylehub.domain.wishlist.service.WishlistService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // 내 폴더 목록
    @GetMapping("/folders")
    public ResponseEntity<ApiResponse<List<WishlistDto.FolderResponse>>> getFolders(
            @LoginUser AuthUser userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getFolders(userDetails.userId())));
    }

    // 폴더 생성
    @PostMapping("/folders")
    public ResponseEntity<ApiResponse<WishlistDto.FolderResponse>> createFolder(
            @LoginUser AuthUser userDetails,
            @RequestBody WishlistDto.FolderCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                wishlistService.createFolder(userDetails.userId(), request.getFolderName())));
    }

    // 찜 추가
    @PostMapping
    public ResponseEntity<ApiResponse<WishlistDto.ItemResponse>> add(
            @LoginUser AuthUser userDetails,
            @RequestBody WishlistDto.AddRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.addWishlist(userDetails.userId(), request)));
    }

    // 찜 삭제
    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable Integer wishlistId
    ) {
        wishlistService.removeWishlist(wishlistId);
        return ResponseEntity.ok(ApiResponse.success());
    }

    // 내 찜 목록 전체
    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistDto.ItemResponse>>> getMyWishlist(
            @LoginUser AuthUser userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getMyWishlist(userDetails.userId())));
    }

    // 특정 폴더 찜 목록
    @GetMapping("/folders/{folderId}")
    public ResponseEntity<ApiResponse<WishlistDto.FolderWithItemsResponse>> getFolderItems(
            @PathVariable Integer folderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getFolderItems(folderId)));
    }

    @DeleteMapping("/folders/{folderId}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            @LoginUser AuthUser userDetails,
            @PathVariable Integer folderId
    ) {
        wishlistService.deleteFolder(userDetails.userId(), folderId);
        return ResponseEntity.ok(ApiResponse.success());
    }

}